import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { logAuditEvent } from '../utils/auditLogger';

/**
 * Helmet secure HTTP headers configuration
 * Strict Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options
 */
export const helmetSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:5000', 'http://localhost:5173', 'ws://localhost:5173', 'http://127.0.0.1:5000', 'http://127.0.0.1:5173'],
    },
  },
  crossOriginEmbedderPolicy: false,
  xFrameOptions: { action: 'deny' },
  xContentTypeOptions: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
});

/**
 * Auth endpoint rate limiter (protects against brute force credential stuffing)
 * Max 15 requests per 15-minute window
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logAuditEvent({
      req,
      action: 'RATE_LIMIT_EXCEEDED',
      resource: '/api/auth/login',
      status: 'DENIED',
      details: { reason: 'Too many authentication attempts. IP temporarily throttled.' },
    });
    res.status(429).json({
      error: 'Too many login attempts. Please wait 15 minutes to protect your account against brute-force attacks.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * General API Rate Limiter (300 requests per minute per IP)
 */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Batch Data Upload Rate Limiter (max 30 batch uploads per 10 minutes)
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Upload velocity limit reached. Please wait before uploading further survey batches.',
  },
});

/**
 * Basic Virus, Malware & Executable Signature Scanner for File Uploads
 */
export function scanFileSafety(fileName: string, fileBufferOrText: string | Buffer): { isSafe: boolean; reason?: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = ['csv', 'xlsx', 'xls', 'json', 'txt'];

  if (!allowedExtensions.includes(ext)) {
    return { isSafe: false, reason: `Disallowed file extension .${ext}. Only CSV, Excel (.xlsx, .xls), and JSON are permitted.` };
  }

  // Dangerous Windows & Linux executable extensions
  const dangerousExts = ['exe', 'bat', 'cmd', 'vbs', 'ps1', 'sh', 'dll', 'jar', 'msi', 'bin', 'scr', 'pif', 'com'];
  if (dangerousExts.some((d) => fileName.toLowerCase().includes(`.${d}`))) {
    return { isSafe: false, reason: 'Suspicious executable extension detected in filename structure.' };
  }

  const contentStr = typeof fileBufferOrText === 'string' ? fileBufferOrText : fileBufferOrText.toString('utf-8');

  // 1. Magic Bytes Check for Executables: Windows PE (MZ, 0x4D 0x5A) or Linux ELF (0x7F 'E' 'L' 'F')
  if (Buffer.isBuffer(fileBufferOrText)) {
    if (fileBufferOrText.length >= 2 && fileBufferOrText[0] === 0x4d && fileBufferOrText[1] === 0x5a) {
      return { isSafe: false, reason: 'Binary signature match: Windows Portable Executable (MZ) header detected in upload.' };
    }
    if (fileBufferOrText.length >= 4 && fileBufferOrText[0] === 0x7f && fileBufferOrText[1] === 0x45 && fileBufferOrText[2] === 0x4c && fileBufferOrText[3] === 0x46) {
      return { isSafe: false, reason: 'Binary signature match: Linux ELF binary header detected in upload.' };
    }
  }

  // 2. CSV Formula Injection (DDE attack vectors: =cmd, @SUM(...)cmd, +cmd, -cmd)
  const ddeInjectionPattern = /^[\s\t]*[=@+\-](cmd|powershell|mshta|calc|cscript|wscript|certutil)/im;
  if (ddeInjectionPattern.test(contentStr)) {
    return { isSafe: false, reason: 'Malicious Dynamic Data Exchange (DDE) formula injection detected in survey dataset.' };
  }

  // 3. Web Script Tag Injection in survey fields (<script>, javascript:, onload=)
  const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>|javascript:|onerror\s*=|onload\s*=/i;
  if (scriptPattern.test(contentStr)) {
    return { isSafe: false, reason: 'Embedded HTML/JavaScript payload detected in survey payload.' };
  }

  return { isSafe: true };
}

/**
 * Input sanitization & SQL/Command injection prevention middleware
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const checkValue = (val: any): boolean => {
      if (typeof val === 'string') {
        // Path traversal check
        if (val.includes('../') || val.includes('..\\')) return false;
        // Basic SQL Injection pattern check
        const sqliPattern = /(\bUNION\b\s+\bSELECT\b|;\s*DROP\s+TABLE|;\s*DELETE\s+FROM|;\s*UPDATE\b\s+\w+\s+\bSET\b)/i;
        if (sqliPattern.test(val)) return false;
        // Script tag check
        if (/<script\b/i.test(val)) return false;
      } else if (typeof val === 'object' && val !== null) {
        for (const k of Object.keys(val)) {
          if (!checkValue(val[k])) return false;
        }
      }
      return true;
    };

    if (!checkValue(req.body)) {
      logAuditEvent({
        req,
        action: 'MALICIOUS_INPUT_BLOCKED',
        resource: req.path,
        status: 'DENIED',
        details: { reason: 'Dangerous character sequence or injection pattern detected.' },
      });
      return res.status(400).json({ error: 'Security violation: Suspicious input pattern or dangerous characters detected.' });
    }
  }
  next();
}

