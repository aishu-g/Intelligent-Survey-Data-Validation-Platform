import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();
const prisma = new PrismaClient();

// GET /api/records
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      batchId,
      stateCode,
      sector,
      hasFlags,
      search,
      sortBy = 'surDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (batchId && typeof batchId === 'string' && batchId !== 'all') {
      where.batchId = batchId;
    }
    if (stateCode && typeof stateCode === 'string' && stateCode !== 'all') {
      where.stateCode = stateCode;
    }
    if (sector && typeof sector === 'string' && sector !== 'all') {
      where.sector = sector;
    }
    if (hasFlags === 'true') {
      where.flags = { some: {} };
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { fileId: { contains: search } },
        { enumeratorId: { contains: search } },
        { stateCode: { contains: search } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.surveyRecord.count({ where }),
      prisma.surveyRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          batch: {
            select: { surveyName: true, quarter: true },
          },
          flags: {
            select: { id: true, severity: true, detectionMethod: true, anomalyScore: true, status: true },
          },
        },
      }),
    ]);

    return res.json({
      records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error('Error fetching records:', err);
    return res.status(500).json({ error: 'Failed to fetch survey records' });
  }
});

// GET /api/records/peer-stats
router.get('/peer-stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { stateCode, districtCode, hhSize } = req.query;

    const where: any = {};
    if (stateCode) where.stateCode = stateCode as string;
    if (districtCode) where.districtCode = districtCode as string;

    const records = await prisma.surveyRecord.findMany({
      where,
      select: { hceTot: true, incTot: true, hhSize: true },
      take: 500,
    });

    if (records.length === 0) {
      return res.json({
        peerCount: 0,
        medianHce: 35000,
        q1Hce: 22000,
        q3Hce: 48000,
        medianInc: 42000,
        q1Inc: 28000,
        q3Inc: 58000,
      });
    }

    const hceList = records.map(r => r.hceTot).sort((a, b) => a - b);
    const incList = records.map(r => r.incTot).sort((a, b) => a - b);

    const median = (arr: number[]) => arr[Math.floor(arr.length / 2)];
    const q1 = (arr: number[]) => arr[Math.floor(arr.length * 0.25)];
    const q3 = (arr: number[]) => arr[Math.floor(arr.length * 0.75)];

    return res.json({
      peerCount: records.length,
      medianHce: median(hceList),
      q1Hce: q1(hceList),
      q3Hce: q3(hceList),
      medianInc: median(incList),
      q1Inc: q1(incList),
      q3Inc: q3(incList),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute peer stats' });
  }
});

// GET /api/records/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const record = await prisma.surveyRecord.findUnique({
      where: { id },
      include: {
        batch: true,
        flags: {
          include: {
            rule: true,
            reviewedBy: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!record) return res.status(404).json({ error: 'Record not found' });

    await logAuditEvent({
      req,
      action: 'VIEW_RECORD',
      resource: `SurveyRecord/${id}`,
      status: 'SUCCESS',
      details: { fileId: record.fileId, batchId: record.batchId },
    });

    return res.json({ record });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch record details' });
  }
});

// PATCH /api/records/:id (Inline Supervisor Data Correction - RBAC Gated)
router.patch('/:id', authenticate, requireRole(['admin', 'hsd_official']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hceTot, incTot, hhSize, sector, responseCode, notes } = req.body;

    const existing = await prisma.surveyRecord.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Record not found' });

    let extraObj = {};
    try {
      extraObj = JSON.parse(existing.extraJson || '{}');
    } catch (e) {}

    if (notes) {
      extraObj = {
        ...extraObj,
        lastCorrectionNote: notes,
        correctedBy: req.user?.name || 'Supervisor',
        correctedAt: new Date().toISOString(),
      };
    }

    const updateData: any = {
      extraJson: JSON.stringify(extraObj),
    };

    if (hceTot !== undefined) updateData.hceTot = parseFloat(hceTot);
    if (incTot !== undefined) updateData.incTot = parseFloat(incTot);
    if (hhSize !== undefined) updateData.hhSize = parseInt(hhSize, 10);
    if (sector !== undefined) updateData.sector = sector;
    if (responseCode !== undefined) updateData.responseCode = parseInt(responseCode, 10);

    const updatedRecord = await prisma.surveyRecord.update({
      where: { id },
      data: updateData,
      include: {
        batch: true,
        flags: true,
      },
    });

    // Auto-update any associated open flag to 'resolved' with note
    await prisma.anomalyFlag.updateMany({
      where: { recordId: id, status: 'open' },
      data: {
        status: 'resolved',
        reviewedById: req.user?.id || null,
        reviewedAt: new Date(),
      },
    });

    await logAuditEvent({
      req,
      action: 'CORRECT_RECORD',
      resource: `SurveyRecord/${id}`,
      status: 'SUCCESS',
      details: {
        fileId: existing.fileId,
        before: { hceTot: existing.hceTot, incTot: existing.incTot },
        after: { hceTot: updatedRecord.hceTot, incTot: updatedRecord.incTot },
        notes,
      },
    });

    return res.json({
      message: 'Survey record corrected successfully and anomaly flags resolved.',
      record: updatedRecord,
    });
  } catch (err: any) {
    console.error('Error updating survey record:', err);
    return res.status(500).json({ error: 'Failed to correct record data' });
  }
});

export default router;


