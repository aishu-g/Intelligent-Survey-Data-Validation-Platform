import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../prisma/seed';
import { helmetSecurityHeaders, generalApiLimiter, sanitizeInputs } from './middleware/security';

import authRoutes from './routes/auth';
import batchesRoutes from './routes/batches';
import recordsRoutes from './routes/records';
import rulesRoutes from './routes/rules';
import flagsRoutes from './routes/flags';
import modelsRoutes from './routes/models';
import reportsRoutes from './routes/reports';
import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import securityRoutes from './routes/security';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Enforce Secure HTTP Headers via Helmet (CSP, HSTS, X-Frame-Options, X-Content-Type)
app.use(helmetSecurityHeaders);

// CORS configuration
app.use(cors({ origin: '*' }));

// Request body parser with payload size limit (Anti-DoS / Payload Bombs)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Input sanitization middleware (Anti-SQLi, Anti-XSS, Anti-Path Traversal)
app.use(sanitizeInputs);

// General API Rate Limiter
app.use('/api', generalApiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/security', securityRoutes);

// Health check endpoint with security metadata
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'ISDVP-MoSPI',
    security: {
      encryption: 'AES-256-GCM',
      headers: 'HELMET_STRICT',
      audit: 'SHA256_CHAIN_ACTIVE',
    },
  });
});

// Auto-seed check on boot (Local / Standalone node runtime)
async function initServer() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('⚡ Database empty: Auto-seeding initial ISDVP data...');
      await seedDatabase();
    } else {
      console.log(`✓ Database ready with ${userCount} registered users.`);
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 ISDVP Backend Service running on port ${PORT}`);
      console.log(`🔒 Security Layer: AES-256-GCM + Helmet + Merkle Audit Active`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize backend database:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  initServer();
}

export default app;
export { app, prisma };


