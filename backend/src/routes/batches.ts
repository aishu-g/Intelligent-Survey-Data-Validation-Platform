import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadLimiter, scanFileSafety } from '../middleware/security';
import { logAuditEvent } from '../utils/auditLogger';
import { generateSyntheticRecords } from '../utils/generator';

const router = Router();
const prisma = new PrismaClient();

const createBatchSchema = z.object({
  surveyName: z.enum(['PLFS', 'ASI', 'HCES', 'NFHS']),
  quarter: z.string().min(2),
  month: z.string().min(2),
  uploadSource: z.enum(['api', 'batch']),
  initialRecordCount: z.number().optional().default(40),
  fileName: z.string().optional(),
  filePayload: z.string().optional(),
});

// GET /api/batches
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { surveyName, status } = req.query;
    const where: any = {};
    if (surveyName && typeof surveyName === 'string' && surveyName !== 'all') {
      where.surveyName = surveyName;
    }
    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }

    const batches = await prisma.surveyBatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { records: true },
        },
      },
    });

    return res.json({ batches });
  } catch (err: any) {
    console.error('Error fetching batches:', err);
    return res.status(500).json({ error: 'Failed to fetch survey batches' });
  }
});

// POST /api/batches
router.post('/', authenticate, uploadLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const parse = createBatchSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid batch data', details: parse.error.format() });
    }

    const { surveyName, quarter, month, uploadSource, initialRecordCount, fileName, filePayload } = parse.data;

    // Scan file if payload or filename is provided
    if (fileName) {
      const scan = scanFileSafety(fileName, filePayload || '');
      if (!scan.isSafe) {
        await logAuditEvent({
          req,
          action: 'MALWARE_BLOCKED',
          resource: `Upload/${fileName}`,
          status: 'DENIED',
          details: { reason: scan.reason, fileName },
        });
        return res.status(400).json({ error: `File security violation: ${scan.reason}` });
      }
    }

    const batch = await prisma.surveyBatch.create({
      data: {
        surveyName,
        quarter,
        month,
        uploadSource,
        recordCount: 0,
        status: 'ingested',
      },
    });

    // Automatically generate synthetic records for this demo batch
    if (initialRecordCount > 0) {
      await generateSyntheticRecords(batch.id, initialRecordCount, surveyName);
    }

    const updatedBatch = await prisma.surveyBatch.findUnique({
      where: { id: batch.id },
      include: {
        _count: {
          select: { records: true },
        },
      },
    });

    await logAuditEvent({
      req,
      action: 'UPLOAD_BATCH',
      resource: `SurveyBatch/${batch.id}`,
      status: 'SUCCESS',
      details: {
        surveyName,
        quarter,
        recordCount: updatedBatch?._count.records || initialRecordCount,
        uploadSource,
      },
    });

    return res.status(201).json({ batch: updatedBatch });
  } catch (err: any) {
    console.error('Error creating batch:', err);
    return res.status(500).json({ error: 'Failed to create survey batch' });
  }
});

// POST /api/batches/:id/generate-records
router.post('/:id/generate-records', authenticate, uploadLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await prisma.surveyBatch.findUnique({ where: { id } });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const count = typeof req.body.count === 'number' ? req.body.count : 30;
    const generated = await generateSyntheticRecords(batch.id, count, batch.surveyName);

    await logAuditEvent({
      req,
      action: 'INGEST_RECORDS',
      resource: `SurveyBatch/${batch.id}`,
      status: 'SUCCESS',
      details: { recordsGenerated: generated.length, surveyName: batch.surveyName },
    });

    return res.json({
      message: `Successfully generated ${generated.length} synthetic records for ${batch.surveyName}`,
      recordsCreated: generated.length,
    });
  } catch (err: any) {
    console.error('Error generating records:', err);
    return res.status(500).json({ error: 'Failed to generate records' });
  }
});

// GET /api/batches/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await prisma.surveyBatch.findUnique({
      where: { id },
      include: {
        records: {
          take: 50,
          orderBy: { surDate: 'desc' },
          include: {
            flags: true,
          },
        },
        _count: {
          select: { records: true },
        },
      },
    });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    return res.json({ batch });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch batch details' });
  }
});

export default router;

