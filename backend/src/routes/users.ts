import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users (Admin only)
router.get('/', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            rulesCreated: true,
            flagsReviewed: true,
            reportsCreated: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/users/:id/role (Admin only)
router.patch('/:id/role', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'hsd_official', 'viewer'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of [${validRoles.join(', ')}]` });
    }

    const previousUser = await prisma.user.findUnique({ where: { id } });
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    await logAuditEvent({
      req,
      action: 'CHANGE_USER_ROLE',
      resource: `User/${id}`,
      status: 'SUCCESS',
      details: {
        targetUserEmail: updated.email,
        targetUserName: updated.name,
        oldRole: previousUser?.role,
        newRole: role,
      },
    });

    return res.json({ user: updated });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;

