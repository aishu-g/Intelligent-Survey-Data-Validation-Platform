import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();
const prisma = new PrismaClient();

const reportSchema = z.object({
  title: z.string().min(3),
  batchId: z.string().min(1),
  format: z.enum(['csv', 'pdf']),
});

// GET /api/reports
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { generatedAt: 'desc' },
      include: {
        batch: { select: { id: true, surveyName: true, quarter: true, recordCount: true } },
        generatedBy: { select: { id: true, name: true, role: true, email: true } },
      },
    });
    return res.json({ reports });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/reports
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const parse = reportSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid report parameters', details: parse.error.format() });
    }

    const { title, batchId, format } = parse.data;
    const batch = await prisma.surveyBatch.findUnique({ where: { id: batchId } });
    if (!batch) return res.status(404).json({ error: 'Target batch not found' });

    const report = await prisma.report.create({
      data: {
        title,
        batchId,
        format,
        generatedById: req.user.id,
      },
      include: {
        batch: { select: { id: true, surveyName: true, quarter: true } },
        generatedBy: { select: { id: true, name: true, role: true } },
      },
    });

    await logAuditEvent({
      req,
      action: 'EXPORT_REPORT',
      resource: `Report/${report.id}`,
      status: 'SUCCESS',
      details: { title, format, batchSurvey: batch.surveyName },
    });

    return res.status(201).json({ report });
  } catch (err: any) {
    console.error('Error recording report:', err);
    return res.status(500).json({ error: 'Failed to log report' });
  }
});

export default router;

