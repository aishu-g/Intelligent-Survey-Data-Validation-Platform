import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const trainModelSchema = z.object({
  name: z.string().min(3),
  modelType: z.enum([
    'Isolation Forest',
    'One-Class SVM',
    'Bayesian Hierarchical',
    'DBSCAN',
    'ARIMA-Prophet',
    'XGBoost',
    'Autoencoder',
  ]),
  batchId: z.string().min(1),
  version: z.string().default('v1.0.0'),
});

// GET /api/models
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const models = await prisma.mlModel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        trainedOnBatch: { select: { id: true, surveyName: true, quarter: true } },
      },
    });
    return res.json({ models });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch ML models' });
  }
});

// POST /api/models/train (Simulated demo ML training lifecycle)
router.post('/train', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const parse = trainModelSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid model parameters', details: parse.error.format() });
    }

    const { name, modelType, batchId, version } = parse.data;
    const batch = await prisma.surveyBatch.findUnique({ where: { id: batchId } });
    if (!batch) return res.status(404).json({ error: 'Target training batch not found' });

    // Deterministic plausible accuracy metric simulation
    const baseAcc = modelType === 'Isolation Forest' ? 94.2 : modelType === 'Autoencoder' ? 96.1 : 91.5;
    const computedAccuracy = parseFloat((baseAcc + (Math.random() * 3.5 - 1.0)).toFixed(1));

    // Create initially in 'training' status
    const model = await prisma.mlModel.create({
      data: {
        name,
        modelType,
        trainedOnBatchId: batch.id,
        version,
        status: 'active', // Set active directly or after simulated training
        accuracyMetric: computedAccuracy,
      },
      include: {
        trainedOnBatch: { select: { id: true, surveyName: true, quarter: true } },
      },
    });

    return res.status(201).json({
      message: `Model ${name} trained successfully on ${batch.surveyName} ${batch.quarter}`,
      model,
    });
  } catch (err: any) {
    console.error('Error training model:', err);
    return res.status(500).json({ error: 'Failed to initialize model training' });
  }
});

// PATCH /api/models/:id (Toggle active/archived status)
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'archived', 'training'].includes(status)) {
      return res.status(400).json({ error: 'Invalid model status' });
    }

    const updated = await prisma.mlModel.update({
      where: { id },
      data: { status },
      include: {
        trainedOnBatch: { select: { id: true, surveyName: true, quarter: true } },
      },
    });

    return res.json({ model: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update model status' });
  }
});

export default router;
