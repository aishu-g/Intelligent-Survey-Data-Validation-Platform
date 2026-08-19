"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Seeded PRNG for reproducible deterministic dataset
class SeededRandom {
    s;
    constructor(seed = 123456) {
        this.s = seed;
    }
    next() {
        this.s = (this.s * 9301 + 49297) % 233280;
        return this.s / 233280;
    }
    range(min, max) {
        return min + this.next() * (max - min);
    }
    intRange(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
    pick(items) {
        return items[Math.floor(this.next() * items.length)];
    }
}
async function seedDatabase() {
    console.log('--- Starting ISDVP Seed Process ---');
    const rng = new SeededRandom(42);
    // Clear existing data cleanly in correct relational order
    await prisma.anomalyFlag.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.mlModel.deleteMany({});
    await prisma.validationRule.deleteMany({});
    await prisma.surveyRecord.deleteMany({});
    await prisma.surveyBatch.deleteMany({});
    await prisma.user.deleteMany({});
    // 1. Create Core Demo Users
    const adminPasswordHash = await bcryptjs_1.default.hash('Admin@123', 10);
    const hsdPasswordHash = await bcryptjs_1.default.hash('Hsd@123', 10);
    const viewerPasswordHash = await bcryptjs_1.default.hash('Viewer@123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@mospi.gov.in',
            passwordHash: adminPasswordHash,
            name: 'Dr. A. K. Sharma (Director General)',
            role: 'admin',
        },
    });
    const hsdOfficial = await prisma.user.create({
        data: {
            email: 'hsd.official@mospi.gov.in',
            passwordHash: hsdPasswordHash,
            name: 'Priya Mukherjee (HSD Senior Officer)',
            role: 'hsd_official',
        },
    });
    const viewer = await prisma.user.create({
        data: {
            email: 'viewer@mospi.gov.in',
            passwordHash: viewerPasswordHash,
            name: 'Rajesh Verma (Research Analyst)',
            role: 'viewer',
        },
    });
    console.log('✓ Created demo users (Admin, HSD Official, Viewer)');
    // 2. Create Survey Batches
    const batchesData = [
        {
            surveyName: 'PLFS',
            quarter: 'Q1-2024',
            month: 'Jan 2024 - Mar 2024',
            uploadSource: 'api',
            recordCount: 160,
            status: 'flagged',
        },
        {
            surveyName: 'PLFS',
            quarter: 'Q2-2024',
            month: 'Apr 2024 - Jun 2024',
            uploadSource: 'batch',
            recordCount: 140,
            status: 'validated',
        },
        {
            surveyName: 'HCES',
            quarter: 'Q3-2023',
            month: 'Jul 2023 - Sep 2023',
            uploadSource: 'batch',
            recordCount: 80,
            status: 'ingested',
        },
        {
            surveyName: 'ASI',
            quarter: '2023-24',
            month: 'Annual Round',
            uploadSource: 'api',
            recordCount: 60,
            status: 'validated',
        },
    ];
    const batches = [];
    for (const b of batchesData) {
        const createdBatch = await prisma.surveyBatch.create({ data: b });
        batches.push(createdBatch);
    }
    console.log(`✓ Created ${batches.length} survey batches`);
    // 3. Create Validation Rules
    const rulesData = [
        {
            name: 'Consumption Outlier (>3x Income)',
            ruleType: 'cross_field',
            fieldName: 'hceTot',
            operator: 'ratio_gt_inc_3',
            value: '3.0',
            severity: 'high',
            isActive: true,
            createdById: admin.id,
        },
        {
            name: 'Invalid Negative Income',
            ruleType: 'range',
            fieldName: 'incTot',
            operator: '<',
            value: '0',
            severity: 'high',
            isActive: true,
            createdById: admin.id,
        },
        {
            name: 'Extreme High Expenditure (> ₹2,50,000/mo)',
            ruleType: 'range',
            fieldName: 'hceTot',
            operator: '>',
            value: '250000',
            severity: 'medium',
            isActive: true,
            createdById: hsdOfficial.id,
        },
        {
            name: 'Household Size Exceeds Normal Limits (>10)',
            ruleType: 'range',
            fieldName: 'hhSize',
            operator: '>',
            value: '10',
            severity: 'medium',
            isActive: true,
            createdById: admin.id,
        },
        {
            name: 'Zero Member Household',
            ruleType: 'range',
            fieldName: 'hhSize',
            operator: '<=',
            value: '0',
            severity: 'high',
            isActive: true,
            createdById: admin.id,
        },
        {
            name: 'Proxy Response with Discrepant Income',
            ruleType: 'cross_field',
            fieldName: 'responseCode',
            operator: 'proxy_high_income',
            value: '4',
            severity: 'medium',
            isActive: true,
            createdById: hsdOfficial.id,
        },
        {
            name: 'Sub-Poverty Line Zero Expenditure',
            ruleType: 'existential',
            fieldName: 'hceTot',
            operator: '<=',
            value: '500',
            severity: 'high',
            isActive: true,
            createdById: admin.id,
        },
        {
            name: 'High Income Urban Single Resident',
            ruleType: 'cross_field',
            fieldName: 'hhSize',
            operator: 'single_huge_hce',
            value: '1',
            severity: 'low',
            isActive: true,
            createdById: hsdOfficial.id,
        },
        {
            name: 'Missing Survey Date Timestamp',
            ruleType: 'existential',
            fieldName: 'surDate',
            operator: 'not_null',
            value: 'null',
            severity: 'medium',
            isActive: false,
            createdById: admin.id,
        },
    ];
    const rules = [];
    for (const r of rulesData) {
        const createdRule = await prisma.validationRule.create({ data: r });
        rules.push(createdRule);
    }
    console.log(`✓ Created ${rules.length} validation rules`);
    // 4. Generate Realistic Survey Records (PLFS schema)
    const stateList = [
        { code: '07', name: 'Delhi', dists: ['01', '02', '03', '04'] },
        { code: '27', name: 'Maharashtra', dists: ['01', '12', '21', '33'] },
        { code: '19', name: 'West Bengal', dists: ['03', '08', '14', '22'] },
        { code: '33', name: 'Tamil Nadu', dists: ['02', '09', '18', '24'] },
        { code: '09', name: 'Uttar Pradesh', dists: ['05', '11', '28', '42'] },
        { code: '29', name: 'Karnataka', dists: ['01', '15', '20', '26'] },
    ];
    const enumerators = ['ENUM_1042', 'ENUM_1088', 'ENUM_2019', 'ENUM_3044', 'ENUM_4102', 'ENUM_5199', 'ENUM_6021'];
    const allRecords = [];
    let recordCounter = 1000;
    for (const batch of batches) {
        const targetCount = batch.recordCount;
        for (let i = 0; i < targetCount; i++) {
            recordCounter++;
            const st = rng.pick(stateList);
            const dist = rng.pick(st.dists);
            const sector = rng.next() > 0.45 ? 'urban' : 'rural';
            const enumerator = rng.pick(enumerators);
            const hhSize = rng.intRange(1, 8);
            // Base realistic monthly income and consumption
            let incTot = Math.round(rng.range(12000, 85000) * (sector === 'urban' ? 1.4 : 0.9) * (hhSize * 0.45 + 0.55));
            let hceTot = Math.round(incTot * rng.range(0.45, 0.85));
            let responseCode = rng.next() > 0.85 ? rng.pick([2, 3, 4]) : 1;
            // Inject intentional anomalies into ~12% of records
            const isAnomaly = rng.next() < 0.13;
            let anomalyType = '';
            if (isAnomaly) {
                const typeRoll = rng.next();
                if (typeRoll < 0.25) {
                    // Extreme consumption over income
                    hceTot = incTot * rng.range(3.2, 5.5);
                    anomalyType = 'expenditure_spike';
                }
                else if (typeRoll < 0.45) {
                    // Negative or unrealistically low income with high consumption
                    incTot = rng.next() < 0.5 ? -1500 : 0;
                    hceTot = Math.round(rng.range(25000, 60000));
                    anomalyType = 'negative_income';
                }
                else if (typeRoll < 0.65) {
                    // Huge household size anomaly
                    incTot = Math.round(rng.range(150000, 350000));
                    hceTot = Math.round(rng.range(260000, 380000));
                    anomalyType = 'super_high_exp';
                }
                else if (typeRoll < 0.85) {
                    // Clustered enumerator artifact
                    responseCode = 4;
                    incTot = 45000;
                    hceTot = 44500;
                    anomalyType = 'enumerator_cluster';
                }
                else {
                    // Sub poverty near-zero
                    hceTot = 350;
                    anomalyType = 'sub_poverty_zero';
                }
            }
            const day = String(rng.intRange(1, 28)).padStart(2, '0');
            const monthNum = batch.quarter.includes('Q1') ? '02' : batch.quarter.includes('Q2') ? '05' : '08';
            const surDate = `2024-${monthNum}-${day}`;
            const rec = await prisma.surveyRecord.create({
                data: {
                    batchId: batch.id,
                    fileId: `PLFS_${batch.quarter.replace('-', '_')}_${recordCounter}`,
                    stateCode: st.code,
                    districtCode: dist,
                    hhSize,
                    hceTot: Math.round(hceTot),
                    incTot: Math.round(incTot),
                    sector,
                    enumeratorId: enumerator,
                    responseCode,
                    surDate,
                    extraJson: JSON.stringify({
                        stateName: st.name,
                        psuId: `PSU_${st.code}_${dist}_${rng.intRange(10, 99)}`,
                        religion: rng.pick(['Hinduism', 'Islam', 'Christianity', 'Sikhism']),
                        socialGroup: rng.pick(['General', 'OBC', 'SC', 'ST']),
                        landOwnedHa: parseFloat(rng.range(0, 3.5).toFixed(2)),
                        anomalyTag: anomalyType || 'normal',
                    }),
                },
            });
            allRecords.push({ record: rec, anomalyType });
        }
    }
    console.log(`✓ Created ${allRecords.length} realistic PLFS survey records across batches`);
    // 5. Generate Realistic Anomaly Flags with SHAP Explainability Reasoning
    const explanationTemplates = [
        {
            method: 'rule',
            severity: 'high',
            score: 92.5,
            ruleName: 'Consumption Outlier (>3x Income)',
            text: 'Reported household consumption (₹{hce}) exceeds total declared income (₹{inc}) by 3.8x, violating cross-field consistency limits.',
        },
        {
            method: 'rule',
            severity: 'high',
            score: 96.0,
            ruleName: 'Invalid Negative Income',
            text: 'Declared income value (₹{inc}) is negative or zero while monthly consumer expenditure is ₹{hce}. Hard rule violation.',
        },
        {
            method: 'ml',
            severity: 'high',
            score: 88.4,
            ruleName: null,
            text: 'SHAP Feature Attribution: Household size ({hhSize}) vs Expenditure (₹{hce}) is +3.6σ away from the district {district} multivariate cluster median (Isolation Forest score: 0.88).',
        },
        {
            method: 'statistical',
            severity: 'medium',
            score: 74.2,
            ruleName: null,
            text: 'Enumerator {enumerator} exhibits a 4.8x higher variance in non-proxy response codes compared to peer benchmarks in State {state}. Potential survey protocol drift.',
        },
        {
            method: 'ml',
            severity: 'medium',
            score: 79.1,
            ruleName: null,
            text: 'Bayesian Hierarchical Model detected abnormal expenditure-to-income gradient for rural stratum in State {state} (Confidence: 89.2%).',
        },
        {
            method: 'statistical',
            severity: 'low',
            score: 61.5,
            ruleName: null,
            text: 'Mild outlier: Household consumer expenditure of ₹{hce} is in the 98th percentile for PSU cluster, but consistent with land holding.',
        },
        {
            method: 'rule',
            severity: 'medium',
            score: 77.0,
            ruleName: 'Extreme High Expenditure (> ₹2,50,000/mo)',
            text: 'Reported monthly expenditure of ₹{hce} exceeds state cap of ₹2,50,000. Requires supervisor verification.',
        },
    ];
    let flagCount = 0;
    for (const item of allRecords) {
        const r = item.record;
        const isTarget = item.anomalyType !== '' || rng.next() < 0.05;
        if (isTarget) {
            const template = rng.pick(explanationTemplates);
            let ruleMatch = null;
            if (template.ruleName) {
                ruleMatch = rules.find((rule) => rule.name === template.ruleName) || null;
            }
            let explanation = template.text
                .replace('{hce}', r.hceTot.toLocaleString('en-IN'))
                .replace('{inc}', r.incTot.toLocaleString('en-IN'))
                .replace('{hhSize}', String(r.hhSize))
                .replace('{district}', r.districtCode)
                .replace('{enumerator}', r.enumeratorId)
                .replace('{state}', r.stateCode);
            const statusRoll = rng.next();
            let status = 'open';
            let reviewedBy = null;
            let reviewedAt = null;
            if (statusRoll < 0.25) {
                status = 'reviewed';
                reviewedBy = hsdOfficial.id;
                reviewedAt = new Date(Date.now() - rng.intRange(1, 10) * 86400000);
            }
            else if (statusRoll < 0.4) {
                status = 'resolved';
                reviewedBy = admin.id;
                reviewedAt = new Date(Date.now() - rng.intRange(1, 5) * 86400000);
            }
            else if (statusRoll < 0.48) {
                status = 'false_positive';
                reviewedBy = hsdOfficial.id;
                reviewedAt = new Date(Date.now() - rng.intRange(1, 8) * 86400000);
            }
            await prisma.anomalyFlag.create({
                data: {
                    recordId: r.id,
                    ruleId: ruleMatch ? ruleMatch.id : null,
                    detectionMethod: template.method,
                    anomalyScore: Math.round(template.score + rng.range(-4, 4)),
                    severity: template.severity,
                    explanationText: explanation,
                    status,
                    reviewedById: reviewedBy,
                    reviewedAt,
                    createdAt: new Date(Date.now() - rng.intRange(1, 30) * 86400000),
                },
            });
            flagCount++;
        }
    }
    console.log(`✓ Created ${flagCount} anomaly flags with SHAP explanations`);
    // 6. Create ML Model Records
    const mlModelsData = [
        {
            name: 'PLFS Multi-Var Isolation Forest v2.1',
            modelType: 'Isolation Forest',
            trainedOnBatchId: batches[0].id,
            version: 'v2.1.0',
            status: 'active',
            accuracyMetric: 94.8,
        },
        {
            name: 'Bayesian Sub-District Expenditure Regressor',
            modelType: 'Bayesian Hierarchical',
            trainedOnBatchId: batches[0].id,
            version: 'v1.4.2',
            status: 'active',
            accuracyMetric: 91.3,
        },
        {
            name: 'PSU Spatial-Cluster Anomaly DBSCAN',
            modelType: 'DBSCAN',
            trainedOnBatchId: batches[1].id,
            version: 'v1.0.1',
            status: 'archived',
            accuracyMetric: 87.5,
        },
    ];
    for (const m of mlModelsData) {
        await prisma.mlModel.create({ data: m });
    }
    console.log('✓ Created ML model entries');
    // 7. Create Sample Reports
    const reportsData = [
        {
            title: 'PLFS Q1-2024 Data Quality & Anomaly Triage Audit',
            batchId: batches[0].id,
            format: 'pdf',
            generatedById: hsdOfficial.id,
            generatedAt: new Date(Date.now() - 4 * 86400000),
        },
        {
            title: 'Cross-Field Rule Discrepancy Export (Q1-2024)',
            batchId: batches[0].id,
            format: 'csv',
            generatedById: admin.id,
            generatedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
            title: 'PLFS Q2-2024 Pre-Validation Readiness Summary',
            batchId: batches[1].id,
            format: 'pdf',
            generatedById: admin.id,
            generatedAt: new Date(Date.now() - 1 * 86400000),
        },
        {
            title: 'HCES Consumption Outliers Extraction',
            batchId: batches[2].id,
            format: 'csv',
            generatedById: viewer.id,
            generatedAt: new Date(Date.now() - 6 * 86400000),
        },
    ];
    for (const rep of reportsData) {
        await prisma.report.create({ data: rep });
    }
    console.log('✓ Created initial audit reports');
    console.log('--- ISDVP Database Seeding Completed Successfully ---');
}
// Allow direct CLI execution
if (require.main === module) {
    seedDatabase()
        .then(async () => {
        await prisma.$disconnect();
        process.exit(0);
    })
        .catch(async (e) => {
        console.error('Seed Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
}
