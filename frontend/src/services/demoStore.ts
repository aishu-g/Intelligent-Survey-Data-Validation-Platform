// Client-side Demo Data Store for Standalone Vercel Deployments

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hsd_official' | 'viewer';
  organization?: string;
}

export const DEMO_USERS: Record<string, { pass: string; user: DemoUser }> = {
  'admin@mospi.gov.in': {
    pass: 'Admin@123',
    user: {
      id: 'usr-admin-01',
      name: 'Dr. A. K. Sharma (Director General)',
      email: 'admin@mospi.gov.in',
      role: 'admin',
      organization: 'MoSPI - National Statistics Office',
    },
  },
  'hsd.official@mospi.gov.in': {
    pass: 'Hsd@123',
    user: {
      id: 'usr-hsd-02',
      name: 'Priya Mukherjee (HSD Senior Officer)',
      email: 'hsd.official@mospi.gov.in',
      role: 'hsd_official',
      organization: 'Household Survey Division (HSD)',
    },
  },
  'viewer@mospi.gov.in': {
    pass: 'Viewer@123',
    user: {
      id: 'usr-viewer-03',
      name: 'Rajesh Verma (Research Analyst)',
      email: 'viewer@mospi.gov.in',
      role: 'viewer',
      organization: 'Independent Research Analyst',
    },
  },
};

export const DEMO_BATCHES = [
  {
    id: 'batch-plfs-q1-2024',
    surveyName: 'PLFS',
    quarter: 'Q1-2024',
    month: 'Jan 2024 - Mar 2024',
    uploadSource: 'api',
    recordCount: 160,
    status: 'flagged',
    createdAt: '2026-08-19T10:00:00.000Z',
  },
  {
    id: 'batch-plfs-q2-2024',
    surveyName: 'PLFS',
    quarter: 'Q2-2024',
    month: 'Apr 2024 - Jun 2024',
    uploadSource: 'batch',
    recordCount: 140,
    status: 'validated',
    createdAt: '2026-08-18T14:30:00.000Z',
  },
  {
    id: 'batch-hces-q3-2023',
    surveyName: 'HCES',
    quarter: 'Q3-2023',
    month: 'Jul 2023 - Sep 2023',
    uploadSource: 'batch',
    recordCount: 80,
    status: 'ingested',
    createdAt: '2026-08-17T09:15:00.000Z',
  },
  {
    id: 'batch-asi-2023-24',
    surveyName: 'ASI',
    quarter: 'Annual 2023-24',
    month: 'Apr 2023 - Mar 2024',
    uploadSource: 'api',
    recordCount: 65,
    status: 'flagged',
    createdAt: '2026-08-16T16:45:00.000Z',
  },
];

export const DEMO_MODELS = [
  {
    id: 'mod-01',
    name: 'PLFS Autoencoder Anomaly Detector',
    modelType: 'Autoencoder',
    version: 'v2.2.0',
    status: 'active',
    accuracyMetric: 98.5,
    createdAt: '2026-08-19T16:58:22.911Z',
    trainedOnBatch: { id: 'batch-plfs-q1-2024', surveyName: 'PLFS', quarter: 'Q3-2024' },
  },
  {
    id: 'mod-02',
    name: 'PLFS Multi-Var Isolation Forest v2.1',
    modelType: 'Isolation Forest',
    version: 'v2.1.0',
    status: 'active',
    accuracyMetric: 94.8,
    createdAt: '2026-08-19T16:05:32.459Z',
    trainedOnBatch: { id: 'batch-plfs-q1-2024', surveyName: 'PLFS', quarter: 'Q1-2024' },
  },
  {
    id: 'mod-03',
    name: 'Bayesian Sub-District Expenditure Regressor',
    modelType: 'Bayesian Hierarchical',
    version: 'v1.4.2',
    status: 'active',
    accuracyMetric: 91.3,
    createdAt: '2026-08-19T16:05:32.485Z',
    trainedOnBatch: { id: 'batch-plfs-q2-2024', surveyName: 'PLFS', quarter: 'Q1-2024' },
  },
  {
    id: 'mod-04',
    name: 'PSU Spatial-Cluster Anomaly DBSCAN',
    modelType: 'DBSCAN',
    version: 'v1.0.1',
    status: 'archived',
    accuracyMetric: 87.5,
    createdAt: '2026-08-19T16:05:32.494Z',
    trainedOnBatch: { id: 'batch-hces-q3-2023', surveyName: 'PLFS', quarter: 'Q2-2024' },
  },
];

export const DEMO_RULES = [
  {
    id: 'rule-01',
    name: 'Household Expenditure vs Income Coherence',
    surveyType: 'PLFS',
    category: 'Relational Consistency',
    expression: 'hceTot <= (incTot * 1.5) + 5000',
    severity: 'High',
    actionOnFail: 'Flag for Supervisor Triage',
    isActive: true,
    createdAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'rule-02',
    name: 'Working Age vs Employment Status Check',
    surveyType: 'PLFS',
    category: 'Demographic Validity',
    expression: 'age >= 15 || activityStatus == "Child / Student"',
    severity: 'Critical',
    actionOnFail: 'Reject Record & Require Resurvey',
    isActive: true,
    createdAt: '2026-08-12T10:00:00.000Z',
  },
  {
    id: 'rule-03',
    name: 'Per-Capita Cereals Minimum Plausibility',
    surveyType: 'HCES',
    category: 'Consumption Plausibility',
    expression: 'cerealsKg >= hhSize * 2.5',
    severity: 'Medium',
    actionOnFail: 'Auto-Impute Suggestion',
    isActive: true,
    createdAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'rule-04',
    name: 'Industrial Gross Output Non-Negative Balance',
    surveyType: 'ASI',
    category: 'Economic Balance',
    expression: 'grossOutput >= totalExpenses',
    severity: 'High',
    actionOnFail: 'Flag for Auditor Review',
    isActive: true,
    createdAt: '2026-08-18T10:00:00.000Z',
  },
];

export const DEMO_RECORDS = Array.from({ length: 40 }).map((_, idx) => {
  const states = ['Maharashtra', 'Uttar Pradesh', 'Tamil Nadu', 'Bihar', 'Karnataka', 'West Bengal', 'Rajasthan', 'Kerala'];
  const state = states[idx % states.length];
  const sector = idx % 2 === 0 ? 'urban' : 'rural';
  const hhSize = (idx % 6) + 2;
  const incTot = (idx + 3) * 8500;
  const hceTot = Math.round(incTot * (0.6 + (idx % 4) * 0.15));
  const isFlagged = idx % 5 === 0;

  return {
    id: `rec-2024-${(1000 + idx)}`,
    batchId: 'batch-plfs-q1-2024',
    surveyName: 'PLFS',
    state,
    district: `${state} Central`,
    subDistrict: `Block-${(idx % 12) + 1}`,
    sector,
    psuId: `PSU-${200 + (idx % 15)}`,
    fsuId: `FSU-${400 + (idx % 15)}`,
    stratum: `Stratum-${(idx % 4) + 1}`,
    hhId: `HH_${10000 + idx}`,
    hhSize,
    hceTot,
    incTot,
    cerealQtyKg: hhSize * 8.5,
    cerealValRs: Math.round(hhSize * 8.5 * 38),
    fuelLightExp: Math.round(hceTot * 0.12),
    clothingExp: Math.round(hceTot * 0.09),
    educExp: Math.round(hceTot * 0.14),
    medExp: Math.round(hceTot * 0.08),
    durablesExp: Math.round(hceTot * 0.05),
    miscExp: Math.round(hceTot * 0.15),
    mpce: Math.round(hceTot / hhSize),
    enumeratorId: `ENUM_${100 + (idx % 8)}`,
    enumeratorName: `Field Officer ${(idx % 8) + 1}`,
    interviewDurationMin: 35 + (idx % 25),
    gpsLatitude: 18.5204 + (idx * 0.01),
    gpsLongitude: 73.8567 + (idx * 0.01),
    isFlagged,
    validationStatus: isFlagged ? 'flagged' : 'valid',
    data: {
      hhSize,
      hceTot,
      incTot,
      sector,
      state,
    },
    flags: isFlagged
      ? [
          {
            id: `flag-auto-${idx}`,
            ruleId: 'rule-01',
            severity: 'High',
            category: 'Relational Consistency',
            description: `Household reported expenditure (₹${hceTot.toLocaleString()}) exceeds income baseline.`,
            status: 'OPEN',
            createdAt: '2026-08-19T11:00:00.000Z',
          },
        ]
      : [],
  };
});

export const DEMO_FLAGS = DEMO_RECORDS.filter((r) => r.isFlagged).map((r, idx) => ({
  id: `flag-item-${idx + 1}`,
  recordId: r.id,
  ruleId: 'rule-01',
  category: 'Relational Consistency',
  severity: 'High',
  description: `Household reported expenditure (₹${r.hceTot.toLocaleString()}) significantly exceeds baseline.`,
  status: 'OPEN',
  assignedTo: 'Priya Mukherjee (HSD)',
  createdAt: '2026-08-19T11:00:00.000Z',
  record: r,
}));

export const DEMO_AUDIT_LOGS = [
  {
    id: 'log-01',
    action: 'LOGIN',
    userName: 'Dr. A. K. Sharma (Director General)',
    userEmail: 'admin@mospi.gov.in',
    resource: 'AUTH_GATEWAY',
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    details: { ip: '10.0.12.4', authMethod: 'PASSWORD_HASH_BCRYPT' },
  },
  {
    id: 'log-02',
    action: 'UPLOAD_BATCH',
    userName: 'Priya Mukherjee (HSD)',
    userEmail: 'hsd.official@mospi.gov.in',
    resource: 'PLFS_Q1_2024.csv',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: { recordsIngested: 160, virusScan: 'CLEAN' },
  },
  {
    id: 'log-03',
    action: 'CORRECT_RECORD',
    userName: 'Priya Mukherjee (HSD)',
    userEmail: 'hsd.official@mospi.gov.in',
    resource: 'rec-2024-1005',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: { field: 'hceTot', oldValue: 95000, newValue: 55000 },
  },
  {
    id: 'log-04',
    action: 'CREATE_BACKUP',
    userName: 'System Auto-Guard',
    userEmail: 'system@gov.in',
    resource: 'isdvp_backup_aes256.enc.json',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    details: { cipher: 'AES-256-GCM', checksumVerified: true },
  },
];
