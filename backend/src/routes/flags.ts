import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();
const prisma = new PrismaClient();

// GET /api/flags
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      severity,
      detectionMethod,
      status,
      batchId,
      ruleId,
      page = '1',
      limit = '50',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (severity && typeof severity === 'string' && severity !== 'all') {
      where.severity = severity;
    }
    if (detectionMethod && typeof detectionMethod === 'string' && detectionMethod !== 'all') {
      where.detectionMethod = detectionMethod;
    }
    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }
    if (batchId && typeof batchId === 'string' && batchId !== 'all') {
      where.record = { batchId };
    }
    if (ruleId && typeof ruleId === 'string' && ruleId !== 'all') {
      where.ruleId = ruleId;
    }

    const [total, flags] = await Promise.all([
      prisma.anomalyFlag.count({ where }),
      prisma.anomalyFlag.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          record: {
            include: {
              batch: { select: { id: true, surveyName: true, quarter: true } },
            },
          },
          rule: {
            select: { id: true, name: true, ruleType: true, fieldName: true },
          },
          reviewedBy: {
            select: { id: true, name: true, role: true, email: true },
          },
        },
      }),
    ]);

    return res.json({
      flags,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error('Error fetching flags:', err);
    return res.status(500).json({ error: 'Failed to fetch anomaly flags' });
  }
});

// PATCH /api/flags/:id (Update flag status & supervisor feedback - RBAC Gated)
router.patch('/:id', authenticate, requireRole(['admin', 'hsd_official']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['open', 'reviewed', 'resolved', 'verified_valid', 'escalated', 'investigation', 'false_positive'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of [${validStatuses.join(', ')}]` });
    }

    const existing = await prisma.anomalyFlag.findUnique({
      where: { id },
      include: { record: true }
    });
    if (!existing) return res.status(404).json({ error: 'Flag not found' });

    let updatedExplanation = existing.explanationText;
    if (notes) {
      updatedExplanation = `${existing.explanationText} [Supervisor Note (${req.user?.name || 'Officer'}): ${notes}]`;
    }

    // Also update record extraJson feedback audit trail if notes given
    if (notes && existing.record) {
      try {
        const extraObj = JSON.parse(existing.record.extraJson || '{}');
        const feedbackList = extraObj.supervisorFeedback || [];
        feedbackList.push({
          status,
          notes,
          author: req.user?.name || 'Supervisor',
          role: req.user?.role || 'hsd_official',
          timestamp: new Date().toISOString(),
        });
        extraObj.supervisorFeedback = feedbackList;
        await prisma.surveyRecord.update({
          where: { id: existing.record.id },
          data: { extraJson: JSON.stringify(extraObj) },
        });
      } catch (e) {
        console.error('Error logging feedback to record extraJson:', e);
      }
    }

    const updated = await prisma.anomalyFlag.update({
      where: { id },
      data: {
        status,
        explanationText: updatedExplanation,
        reviewedById: req.user?.id || null,
        reviewedAt: new Date(),
      },
      include: {
        record: {
          include: {
            batch: { select: { id: true, surveyName: true, quarter: true } },
          },
        },
        rule: true,
        reviewedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    await logAuditEvent({
      req,
      action: 'REVIEW_FLAG',
      resource: `AnomalyFlag/${id}`,
      status: 'SUCCESS',
      details: { oldStatus: existing.status, newStatus: status, notes },
    });

    return res.json({ flag: updated, message: `Status updated to ${status}` });
  } catch (err: any) {
    console.error('Error updating flag status:', err);
    return res.status(500).json({ error: 'Failed to update flag status' });
  }
});

// POST /api/flags/bulk (Bulk update status)
router.post('/bulk', authenticate, requireRole(['admin', 'hsd_official']), async (req: AuthRequest, res: Response) => {
  try {
    const { ids, status, notes } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'List of flag IDs required' });
    }

    const validStatuses = ['open', 'reviewed', 'resolved', 'verified_valid', 'escalated', 'investigation', 'false_positive'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of [${validStatuses.join(', ')}]` });
    }

    await prisma.anomalyFlag.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        reviewedById: req.user?.id || null,
        reviewedAt: new Date(),
      },
    });

    await logAuditEvent({
      req,
      action: 'BULK_REVIEW_FLAGS',
      resource: 'AnomalyFlag/Bulk',
      status: 'SUCCESS',
      details: { count: ids.length, newStatus: status },
    });

    return res.json({
      message: `Successfully updated ${ids.length} flags to status: ${status}`,
      count: ids.length,
      status,
    });
  } catch (err: any) {
    console.error('Error in bulk flag update:', err);
    return res.status(500).json({ error: 'Failed to perform bulk flag update' });
  }
});

export default router;

