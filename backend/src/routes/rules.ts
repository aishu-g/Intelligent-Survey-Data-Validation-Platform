import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { evaluateRule } from '../utils/engine';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();
const prisma = new PrismaClient();

const ruleSchema = z.object({
  name: z.string().min(3),
  ruleType: z.enum(['referential', 'existential', 'range', 'cross_field']),
  fieldName: z.string().min(1),
  operator: z.string().min(1),
  value: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high']),
  isActive: z.boolean().optional().default(true),
});

// GET /api/rules
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const rules = await prisma.validationRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        _count: {
          select: { flags: true },
        },
      },
    });
    return res.json({ rules });
  } catch (err: any) {
    console.error('Error fetching rules:', err);
    return res.status(500).json({ error: 'Failed to fetch validation rules' });
  }
});

// POST /api/rules (Admin / Official only)
router.post('/', authenticate, requireRole(['admin', 'hsd_official']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const parse = ruleSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid rule configuration', details: parse.error.format() });
    }

    const { name, ruleType, fieldName, operator, value, severity, isActive } = parse.data;

    const rule = await prisma.validationRule.create({
      data: {
        name,
        ruleType,
        fieldName,
        operator,
        value,
        severity,
        isActive,
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        _count: { select: { flags: true } },
      },
    });

    await logAuditEvent({
      req,
      action: 'CREATE_RULE',
      resource: `ValidationRule/${rule.id}`,
      status: 'SUCCESS',
      details: { name, ruleType, fieldName, severity },
    });

    return res.status(201).json({ rule });
  } catch (err: any) {
    console.error('Error creating rule:', err);
    return res.status(500).json({ error: 'Failed to create validation rule' });
  }
});

// PATCH /api/rules/:id
router.patch('/:id', authenticate, requireRole(['admin', 'hsd_official']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, ruleType, fieldName, operator, value, severity, isActive } = req.body;

    const existing = await prisma.validationRule.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Rule not found' });

    const updated = await prisma.validationRule.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(ruleType && { ruleType }),
        ...(fieldName && { fieldName }),
        ...(operator && { operator }),
        ...(value && { value }),
        ...(severity && { severity }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        _count: { select: { flags: true } },
      },
    });

    await logAuditEvent({
      req,
      action: 'UPDATE_RULE',
      resource: `ValidationRule/${id}`,
      status: 'SUCCESS',
      details: { name: updated.name, isActive: updated.isActive },
    });

    return res.json({ rule: updated });
  } catch (err: any) {
    console.error('Error updating rule:', err);
    return res.status(500).json({ error: 'Failed to update rule' });
  }
});

// DELETE /api/rules/:id
router.delete('/:id', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.validationRule.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Rule not found' });

    await prisma.validationRule.delete({ where: { id } });

    await logAuditEvent({
      req,
      action: 'DELETE_RULE',
      resource: `ValidationRule/${id}`,
      status: 'SUCCESS',
      details: { ruleName: existing.name },
    });

    return res.json({ message: 'Validation rule deleted successfully', id });
  } catch (err: any) {
    console.error('Error deleting rule:', err);
    return res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// POST /api/rules/:id/run
router.post('/:id/run', authenticate, requireRole(['admin', 'hsd_official']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await evaluateRule(id);

    await logAuditEvent({
      req,
      action: 'EXECUTE_RULE_EVALUATION',
      resource: `ValidationRule/${id}`,
      status: 'SUCCESS',
      details: { evaluated: result.evaluated, newFlags: result.newFlags },
    });

    return res.json({
      message: `Evaluation completed across ${result.evaluated} records. Generated ${result.newFlags} new anomaly flag(s).`,
      evaluatedCount: result.evaluated,
      newFlagsCount: result.newFlags,
      ruleId: id,
    });
  } catch (err: any) {
    console.error('Error running rule:', err);
    return res.status(500).json({ error: err.message || 'Failed to execute rule evaluation' });
  }
});

export default router;

