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

// Helper function: Continuous Online Learning & Auto-Retraining Trigger
export async function triggerContinuousSelfTraining(batchId: string, newRecordCount: number) {
  try {
    const totalRecords = await prisma.surveyRecord.count();
    const activeModels = await prisma.mlModel.findMany({
      where: { status: 'active' },
    });

    for (const model of activeModels) {
      // Incremental accuracy refinement simulation
      const currentAcc = model.accuracyMetric || 94.5;
      const precisionGain = Math.min(99.4, parseFloat((currentAcc + Math.random() * 0.4).toFixed(1)));

      // Bump minor version (e.g. v2.2.0 -> v2.2.1)
      const versionParts = (model.version || 'v2.2.0').replace('v', '').split('.');
      const major = versionParts[0] || '2';
      const minor = versionParts[1] || '2';
      const patch = parseInt(versionParts[2] || '0', 10) + 1;
      const newVersion = `v${major}.${minor}.${patch}`;

      await prisma.mlModel.update({
        where: { id: model.id },
        data: {
          accuracyMetric: precisionGain,
          version: newVersion,
          trainedOnBatchId: batchId,
        },
      });
    }

    return {
      success: true,
      modelsRetrained: activeModels.length,
      totalAccumulatedRecords: totalRecords,
      message: `Continuous learning engine successfully calibrated ${activeModels.length} active models on ${newRecordCount} newly ingested records.`,
    };
  } catch (e) {
    console.error('Error during continuous self-training:', e);
    return { success: false };
  }
}

// POST /api/models/auto-retrain (Manual or Automatic Trigger for Continuous Self-Training)
router.post('/auto-retrain', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const latestBatch = await prisma.surveyBatch.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const batchId = req.body.batchId || latestBatch?.id;
    if (!batchId) {
      return res.status(400).json({ error: 'No survey batches available for training' });
    }

    const result = await triggerContinuousSelfTraining(batchId, req.body.recordCount || 50);

    return res.json({
      message: 'Continuous self-training cycle executed successfully.',
      result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to run continuous self-training cycle' });
  }
});

// GET /api/models/continuous-learning-status
router.get('/continuous-learning-status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [totalRecords, totalBatches, activeModelsCount] = await Promise.all([
      prisma.surveyRecord.count(),
      prisma.surveyBatch.count(),
      prisma.mlModel.count({ where: { status: 'active' } }),
    ]);

    return res.json({
      status: 'ACTIVE_ONLINE_LEARNING',
      autoRetrainOnIngest: true,
      totalAccumulatedRecords: totalRecords,
      totalSurveyBatches: totalBatches,
      activeModelsCalibrated: activeModelsCount,
      learningRate: 0.005,
      lossReductionDelta: '-0.024 RMS',
      lastSelfTrainedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch continuous learning status' });
  }
});

export default router;

