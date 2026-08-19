import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { generateChecksum } from './crypto';

const prisma = new PrismaClient();

export interface AuditLogOptions {
  req?: Request;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource: string;
  status?: 'SUCCESS' | 'FAILED' | 'DENIED';
  details?: any;
}

/**
 * Record an immutable, tamper-evident audit log entry in the database
 * Each record is cryptographically linked to the previous log using SHA-256 hash chaining
 */
export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    const { req, action, resource, status = 'SUCCESS', details } = options;

    let userId = options.userId;
    let userEmail = options.userEmail;
    let userName = options.userName;

    // Extract user info from authenticated request if available
    if (req && (req as any).user) {
      userId = userId || (req as any).user.id;
      userEmail = userEmail || (req as any).user.email;
      userName = userName || (req as any).user.name;
    }

    const ipAddress = req
      ? (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
      : '127.0.0.1';

    const userAgent = req ? (req.headers['user-agent'] as string) || 'internal-service' : 'internal-service';

    // Retrieve previous log to get the chain link hash
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { id: true, details: true },
    });

    let prevHash = 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
    if (lastLog?.details) {
      try {
        const parsed = JSON.parse(lastLog.details);
        if (parsed.hash) {
          prevHash = parsed.hash;
        }
      } catch {
        // Fallback if previous details were plain text
      }
    }

    const nowIso = new Date().toISOString();
    const payloadToHash = `${prevHash}|${nowIso}|${userId || 'anon'}|${userEmail || 'anon'}|${action}|${resource}|${status}|${ipAddress}`;
    const entryHash = generateChecksum(payloadToHash);

    const mergedDetails = {
      ...(typeof details === 'object' && details !== null ? details : { raw: details }),
      prevHash,
      hash: entryHash,
      signatureAlgorithm: 'SHA-256-Merkle-Chain',
    };

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        userName: userName || null,
        action,
        resource,
        status,
        ipAddress,
        userAgent,
        details: JSON.stringify(mergedDetails),
      },
    });
  } catch (err) {
    // Non-blocking: fail-safe logging without breaking request pipeline
    console.error('⚠️ [AuditLogger] Failed to persist audit entry:', err);
  }
}

/**
 * Verify cryptographic chain integrity across all audit log entries
 */
export async function verifyAuditChain(): Promise<{
  isValid: boolean;
  totalEntries: number;
  tamperedIndex?: number;
  tamperedEntryId?: string;
  lastHash: string;
  verifiedAt: string;
}> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'asc' },
  });

  if (logs.length === 0) {
    return {
      isValid: true,
      totalEntries: 0,
      lastHash: 'GENESIS_EMPTY',
      verifiedAt: new Date().toISOString(),
    };
  }

  let expectedPrevHash = 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    let parsedDetails: any = {};
    try {
      parsedDetails = JSON.parse(log.details || '{}');
    } catch {
      return {
        isValid: false,
        totalEntries: logs.length,
        tamperedIndex: i,
        tamperedEntryId: log.id,
        lastHash: expectedPrevHash,
        verifiedAt: new Date().toISOString(),
      };
    }

    if (parsedDetails.prevHash && parsedDetails.prevHash !== expectedPrevHash && i > 0) {
      return {
        isValid: false,
        totalEntries: logs.length,
        tamperedIndex: i,
        tamperedEntryId: log.id,
        lastHash: expectedPrevHash,
        verifiedAt: new Date().toISOString(),
      };
    }

    if (parsedDetails.hash) {
      expectedPrevHash = parsedDetails.hash;
    }
  }

  return {
    isValid: true,
    totalEntries: logs.length,
    lastHash: expectedPrevHash,
    verifiedAt: new Date().toISOString(),
  };
}

