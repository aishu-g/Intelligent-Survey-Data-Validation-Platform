import { PrismaClient, ValidationRule, SurveyRecord } from '@prisma/client';

const prisma = new PrismaClient();

export async function evaluateRule(ruleId: string): Promise<{ evaluated: number; newFlags: number }> {
  const rule = await prisma.validationRule.findUnique({ where: { id: ruleId } });
  if (!rule) {
    throw new Error('Validation rule not found');
  }

  // Fetch survey records
  const records = await prisma.surveyRecord.findMany({
    include: {
      flags: {
        where: { ruleId: rule.id },
      },
    },
  });

  let newFlagsCount = 0;

  for (const record of records) {
    // If flag already exists for this rule on this record, skip to avoid duplicates
    if (record.flags.length > 0) continue;

    let isViolated = false;
    let explanation = '';
    let score = 75.0;

    const valNum = parseFloat(rule.value);

    switch (rule.operator) {
      case '>':
        if (rule.fieldName === 'hceTot' && record.hceTot > valNum) {
          isViolated = true;
          explanation = `Rule Violation: Consumer Expenditure ₹${record.hceTot.toLocaleString('en-IN')} exceeds defined threshold > ₹${valNum.toLocaleString('en-IN')}`;
          score = 82.0;
        } else if (rule.fieldName === 'hhSize' && record.hhSize > valNum) {
          isViolated = true;
          explanation = `Rule Violation: Household size (${record.hhSize}) exceeds maximum permissible limit of ${valNum}`;
          score = 70.0;
        } else if (rule.fieldName === 'incTot' && record.incTot > valNum) {
          isViolated = true;
          explanation = `Rule Violation: Declared Income ₹${record.incTot.toLocaleString('en-IN')} exceeds threshold > ₹${valNum.toLocaleString('en-IN')}`;
          score = 75.0;
        }
        break;

      case '<':
      case '<=':
        if (rule.fieldName === 'incTot' && record.incTot <= valNum) {
          isViolated = true;
          explanation = `Rule Violation: Negative or zero income declared (₹${record.incTot.toLocaleString('en-IN')}) while household has active expenditure.`;
          score = 95.0;
        } else if (rule.fieldName === 'hhSize' && record.hhSize <= valNum) {
          isViolated = true;
          explanation = `Rule Violation: Invalid household member count (${record.hhSize} <= ${valNum}).`;
          score = 90.0;
        } else if (rule.fieldName === 'hceTot' && record.hceTot <= valNum) {
          isViolated = true;
          explanation = `Rule Violation: Sub-poverty line consumption ₹${record.hceTot.toLocaleString('en-IN')} <= ₹${valNum.toLocaleString('en-IN')}.`;
          score = 85.0;
        }
        break;

      case 'ratio_gt_inc_3':
      case 'ratio_gt':
        const ratioLimit = !isNaN(valNum) ? valNum : 3.0;
        if (record.incTot > 0 && record.hceTot > record.incTot * ratioLimit) {
          isViolated = true;
          const ratio = (record.hceTot / record.incTot).toFixed(1);
          explanation = `Cross-Field Discrepancy: Monthly expenditure (₹${record.hceTot.toLocaleString('en-IN')}) is ${ratio}x higher than declared income (₹${record.incTot.toLocaleString('en-IN')}).`;
          score = 93.0;
        }
        break;

      case 'proxy_high_income':
      case '==':
        if (rule.fieldName === 'responseCode' && record.responseCode === 4 && record.incTot > 50000) {
          isViolated = true;
          explanation = `Cross-Field Check: Proxy respondent (Code 4) providing high-bracket income declaration (₹${record.incTot.toLocaleString('en-IN')}). Reliability verification required.`;
          score = 76.0;
        }
        break;

      case 'single_huge_hce':
        if (record.hhSize === 1 && record.hceTot > 100000) {
          isViolated = true;
          explanation = `Cross-Field Anomaly: Single-resident household reporting exceptional monthly consumer expenditure of ₹${record.hceTot.toLocaleString('en-IN')}.`;
          score = 72.0;
        }
        break;

      case 'not_null':
        if (!record.surDate || record.surDate.trim() === '') {
          isViolated = true;
          explanation = `Existential Check: Mandatory survey timestamp is null or empty.`;
          score = 88.0;
        }
        break;

      default:
        // Generic check
        break;
    }

    if (isViolated) {
      await prisma.anomalyFlag.create({
        data: {
          recordId: record.id,
          ruleId: rule.id,
          detectionMethod: 'rule',
          anomalyScore: score,
          severity: rule.severity,
          explanationText: explanation,
          status: 'open',
        },
      });
      newFlagsCount++;
    }
  }

  return { evaluated: records.length, newFlags: newFlagsCount };
}
