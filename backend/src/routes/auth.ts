import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticate, AuthRequest, JWT_SECRET } from '../middleware/auth';
import { authLimiter } from '../middleware/security';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input fields', details: parse.error.format() });
    }

    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      await logAuditEvent({
        req,
        action: 'AUTH_FAILED',
        resource: '/api/auth/login',
        status: 'DENIED',
        userEmail: email,
        details: { reason: 'User account not found' },
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        req,
        action: 'AUTH_FAILED',
        resource: '/api/auth/login',
        status: 'DENIED',
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        details: { reason: 'Password verification failed' },
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditEvent({
      req,
      action: 'LOGIN',
      resource: '/api/auth/login',
      status: 'SUCCESS',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      details: { role: user.role },
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await logAuditEvent({
      req,
      action: 'LOGOUT',
      resource: '/api/auth/logout',
      status: 'SUCCESS',
      details: { message: 'User session terminated' },
    });
    return res.json({ message: 'Session logged out successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// POST /api/auth/signup (Defaults to role 'viewer')
router.post('/signup', authLimiter, async (req: Request, res: Response) => {
  try {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid registration fields', details: parse.error.format() });
    }

    const { email, password, name } = parse.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'viewer',
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditEvent({
      req,
      action: 'USER_REGISTERED',
      resource: `User/${user.id}`,
      status: 'SUCCESS',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      details: { role: 'viewer' },
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/auth/profile (Update name)
router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid name is required' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    await logAuditEvent({
      req,
      action: 'UPDATE_PROFILE',
      resource: `User/${req.user.id}`,
      status: 'SUCCESS',
      details: { updatedFields: ['name'] },
    });

    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;

