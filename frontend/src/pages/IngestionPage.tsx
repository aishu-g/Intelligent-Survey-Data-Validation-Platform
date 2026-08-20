import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  X,
  ArrowRight,
  ShieldAlert,
  FileText,
  Scan,
  CheckSquare,
  Edit3,
  Camera,
  UploadCloud,
  Check,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const IngestionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'historical' | 'ocr'>('current');
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSurvey, setFilterSurvey] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [newSurveyName, setNewSurveyName] = useState('PLFS');
  const [newQuarter, setNewQuarter] = useState('Q3-2024');
  const [newMonth, setNewMonth] = useState('Jul 2024 - Sep 2024');
  const [newUploadSource, setNewUploadSource] = useState('batch');
  const [newRecordCount, setNewRecordCount] = useState(40);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // CSV Import State
  const [parsedCsvRecords, setParsedCsvRecords] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [csvParseError, setCsvParseError] = useState<string>('');

  // Record Explorer State
  const [viewingBatch, setViewingBatch] = useState<any | null>(null);
  const [batchRecords, setBatchRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordSearch, setRecordSearch] = useState('');


  // OCR Studio State
  const ocrPresets = [
    {
      id: 'plfs_rural_clean',
      title: 'MoSPI PLFS Schedule 10.2 (Rural UP / Hardoi)',
      surveyName: 'PLFS',
      quarter: 'Q3-2024',
      month: 'Jul 2024 - Sep 2024',
      description: 'Clean handwritten survey with standard rural agrarian income & consumer expenditure.',
      sourceType: 'Field Schedule 10.2 - Form A',
      rawImageName: 'plfs_schedule_hardoi_0928.png',
      scanNote: 'Legible blue ink handwriting on standard NSO paper schedule.',
      expectedResult: 'Clean / Passes all deterministic & probabilistic baseline checks',
      fields: {
        stateCode: '09',
        districtCode: '28',
        hhSize: 4,
        hceTot: 24500,
        incTot: 32000,
        sector: 'rural' as const,
        enumeratorId: 'ENUM_1042',
        responseCode: 1,
        surDate: '2024-08-14',
      },
      confidences: {
        stateCode: 98,
        districtCode: 95,
        hhSize: 96,
        hceTot: 92,
        incTot: 90,
        sector: 99,
        enumeratorId: 97,
      },
    },
    {
      id: 'hces_urban_anomaly',
      title: 'MoSPI HCES Paper Schedule (Urban Thane) — Outlier Anomaly',
      surveyName: 'HCES',
      quarter: 'Q3-2024',
      month: 'Jul 2024 - Sep 2024',
      description: 'Single-resident household with high expenditure (₹1,35,000) vs low income (₹22,000).',
      sourceType: 'HCES Consumer Schedule 1.0',
      rawImageName: 'hces_paper_thane_2721.png',
      scanNote: 'Slightly faded cursive digits in expenditure column (confidence: 79%).',
      expectedResult: 'Triggers Ratio > 3x & Single-resident High Expenditure Flags in Stage 2 & 3',
      fields: {
        stateCode: '27',
        districtCode: '21',
        hhSize: 1,
        hceTot: 135000,
        incTot: 22000,
        sector: 'urban' as const,
        enumeratorId: 'ENUM_3044',
        responseCode: 1,
        surDate: '2024-08-16',
      },
      confidences: {
        stateCode: 96,
        districtCode: 94,
        hhSize: 98,
        hceTot: 79, // Amber flag
        incTot: 86,
        sector: 99,
        enumeratorId: 95,
      },
    },
    {
      id: 'plfs_heaping_sample',
      title: 'MoSPI PLFS Field Sheet (Bihar / Muzaffarpur) — Digit Heaping',
      surveyName: 'PLFS',
      quarter: 'Q3-2024',
      month: 'Jul 2024 - Sep 2024',
      description: 'Suspicious rounded digits (₹50,000 inc / ₹25,000 exp) indicating enumerator estimation.',
      sourceType: 'Field Schedule 10.2 - Form B',
      rawImageName: 'plfs_paper_bihar_1005.png',
      scanNote: 'Rounded terminal digits 000. Potential enumerator estimation bias.',
      expectedResult: 'Ingests successfully and contributes to Enumerator Digit Heaping Index',
      fields: {
        stateCode: '10',
        districtCode: '05',
        hhSize: 5,
        hceTot: 25000,
        incTot: 50000,
        sector: 'rural' as const,
        enumeratorId: 'ENUM_2019',
        responseCode: 1,
        surDate: '2024-08-18',
      },
      confidences: {
        stateCode: 99,
        districtCode: 97,
        hhSize: 94,
        hceTot: 95,
        incTot: 96,
        sector: 98,
        enumeratorId: 96,
      },
    },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState('plfs_rural_clean');
  const activePreset = ocrPresets.find((p) => p.id === selectedPresetId) || ocrPresets[0];

  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(100);
  const [customImageName, setCustomImageName] = useState<string | null>(null);

  // Editable digitized fields
  const [editableFields, setEditableFields] = useState(activePreset.fields);
  const [confidences, setConfidences] = useState(activePreset.confidences);
  const [humanVerified, setHumanVerified] = useState(true);
  const [verifierNotes, setVerifierNotes] = useState('All handwritten entries cross-verified against paper schedule header.');
  const [ocrIngestStatus, setOcrIngestStatus] = useState<{ success: boolean; message: string; flagsCount?: number; batchId?: string } | null>(null);
  const [ocrSubmitting, setOcrSubmitting] = useState(false);

  // Sync preset changes
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = ocrPresets.find((item) => item.id === presetId) || ocrPresets[0];
    setCustomImageName(null);
    setEditableFields(p.fields);
    setConfidences(p.confidences);
    setHumanVerified(true);
    setOcrIngestStatus(null);
  };

  const handleSimulateScan = () => {
    setOcrScanning(true);
    setOcrProgress(15);
    setOcrIngestStatus(null);

    setTimeout(() => setOcrProgress(45), 300);
    setTimeout(() => setOcrProgress(75), 700);
    setTimeout(() => {
      setOcrProgress(100);
      setOcrScanning(false);
    }, 1100);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomImageName(file.name);
      handleSimulateScan();
    }
  };

  const handleOcrIngestToPipeline = async () => {
    setOcrSubmitting(true);
    try {
      const res = await api.post('/batches/ocr-ingest', {
        surveyName: activePreset.surveyName,
        quarter: activePreset.quarter,
        month: activePreset.month,
        records: [
          {
            ...editableFields,
            rawImageName: customImageName || activePreset.rawImageName,
            ocrConfidence: Math.round(
              Object.values(confidences).reduce((a, b) => a + b, 0) / Object.values(confidences).length
            ),
            fieldsConfidence: confidences,
          },
        ],
        metadata: {
          imageName: customImageName || activePreset.rawImageName,
          verifiedBy: 'HSD Officer',
          verifierNotes,
        },
      });

      setOcrIngestStatus({
        success: true,
        message: res.data.message || 'Successfully ingested handwritten schedule into the validation pipeline!',
        flagsCount: res.data.flagsCount || 0,
        batchId: res.data.batchId,
      });

      // Refresh batch list
      await fetchBatches();
    } catch (err: any) {
      console.error('Error during OCR batch ingest:', err);
      setOcrIngestStatus({
        success: false,
        message: err.response?.data?.error || 'Failed to submit verified OCR record',
      });
    } finally {
      setOcrSubmitting(false);
    }
  };

  // Historical Baseline Profiling Metrics
  const historicalProfile = {
    totalTrainedRecords: 480,
    roundsCount: 4,
    hceMean: '₹34,280',
    hceMedian: '₹31,500',
    hceIQR: '₹22,000 – ₹45,500',
    hceStd: '₹14,200',
    incMean: '₹41,800',
    incMedian: '₹38,000',
    incIQR: '₹26,000 – ₹54,000',
    incStd: '₹18,500',
    correlations: [
      { pair: 'Income ↔ Consumption', coefficient: 0.82, status: 'Strong Positive' },
      { pair: 'Household Size ↔ Consumption', coefficient: 0.64, status: 'Moderate Positive' },
      { pair: 'Education Level ↔ Income', coefficient: 0.71, status: 'Strong Positive' },
    ],
    isolationForestBaseline: {
      status: 'Trained & Calibrated',
      contamination: 0.05,
      trees: 150,
      features: ['hceTot', 'incTot', 'hhSize', 'sector', 'age', 'workingHours'],
      normalityBaselineScore: '94.2%',
    },
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterSurvey !== 'all') params.surveyName = filterSurvey;
      if (filterStatus !== 'all') params.status = filterStatus;

      const res = await api.get('/batches', { params });
      setBatches(res.data.batches || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [filterSurvey, filterStatus]);

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvParseError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setCsvParseError('CSV must contain a header row and at least one data row.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

        const records = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
          if (row.length < 2) continue;

          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = row[idx] || '';
          });

          // Smart column mapping for MoSPI PLFS / HCES datasets
          const stateCode = obj.statecode || obj.state_code || obj.state || obj.st || '07';
          const districtCode = obj.districtcode || obj.district_code || obj.district || obj.dist || '01';
          const hhSize = parseInt(obj.hhsize || obj.household_size || obj.size || obj.members || '4', 10) || 4;
          const hceTot = parseFloat(obj.hcetot || obj.expenditure || obj.consumption || obj.hce || obj.mpce || '25000') || 0;
          const incTot = parseFloat(obj.inctot || obj.income || obj.inc || obj.earnings || '30000') || 0;
          const sector = String(obj.sector || 'rural').toLowerCase().includes('urb') || obj.sector === '2' ? 'urban' : 'rural';
          const enumeratorId = obj.enumeratorid || obj.enumerator_id || obj.enumerator || obj.enum || `ENUM_${1000 + (i % 20)}`;
          const responseCode = parseInt(obj.responsecode || obj.response_code || '1', 10) || 1;
          const surDate = obj.surdate || obj.sur_date || obj.date || new Date().toISOString().split('T')[0];

          records.push({
            fileId: obj.fileid || `CSV_${i}`,
            stateCode: String(stateCode).padStart(2, '0'),
            districtCode: String(districtCode).padStart(2, '0'),
            hhSize,
            hceTot,
            incTot,
            sector,
            enumeratorId,
            responseCode,
            surDate,
          });
        }

        if (records.length === 0) {
          setCsvParseError('Could not parse any valid survey records from this CSV.');
        } else {
          setParsedCsvRecords(records);
        }
      } catch (err: any) {
        setCsvParseError('Error parsing CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sampleHeaders = 'fileId,stateCode,districtCode,hhSize,hceTot,incTot,sector,enumeratorId,responseCode,surDate\n';
    const sampleRows = [
      'PLFS_001,09,28,4,28500,34000,rural,ENUM_1042,1,2024-08-10',
      'PLFS_002,27,21,5,42000,56000,urban,ENUM_3044,1,2024-08-11',
      'PLFS_003,10,05,3,18500,22000,rural,ENUM_2019,1,2024-08-12',
      'PLFS_004,29,15,1,125000,20000,urban,ENUM_4102,1,2024-08-13',
      'PLFS_005,33,02,4,31000,45000,urban,ENUM_5199,1,2024-08-14',
    ].join('\n');

    const blob = new Blob([sampleHeaders + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_mospi_plfs_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage('Ingesting and validating batch records...');

    try {
      if (newUploadSource === 'batch' && parsedCsvRecords.length > 0) {
        await api.post('/batches/csv-upload', {
          surveyName: newSurveyName,
          quarter: newQuarter,
          month: newMonth,
          fileName: csvFileName || 'custom_survey_data.csv',
          records: parsedCsvRecords,
        });
      } else {
        await api.post('/batches', {
          surveyName: newSurveyName,
          quarter: newQuarter,
          month: newMonth,
          uploadSource: newUploadSource,
          initialRecordCount: Number(newRecordCount),
        });
      }

      setShowNewBatchModal(false);
      setParsedCsvRecords([]);
      setCsvFileName('');
      setCsvParseError('');
      setStatusMessage('');
      await fetchBatches();
    } catch (err: any) {
      console.error('Failed to create batch:', err);
      setStatusMessage(err.response?.data?.error || 'Error creating batch');
    } finally {
      setSubmitting(false);
    }
  };


  const handleOpenRecords = async (batch: any) => {
    setViewingBatch(batch);
    setRecordsLoading(true);
    try {
      const res = await api.get(`/records?batchId=${batch.id}&limit=50`);
      setBatchRecords(res.data.records || []);
    } catch (err) {
      console.error('Failed to load batch records:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  const filteredRecords = batchRecords.filter((r) => {
    if (!recordSearch) return true;
    const s = recordSearch.toLowerCase();
    return (
      r.fileId?.toLowerCase().includes(s) ||
      r.stateCode?.toLowerCase().includes(s) ||
      r.enumeratorId?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
              Module 1 & 2 • Dual Ingestion & Verification
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-1">
            Survey Data Ingestion & OCR Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ingest digital datasets (CSV/CAPI), scan & verify handwritten paper survey forms, and calibrate historical baseline models
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsHistoricalMode(false);
              setShowNewBatchModal(true);
            }}
            id="new-batch-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Survey Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'current'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          1. Current Survey Batches ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab('ocr')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ocr'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>2. 📝 Handwritten / Paper Survey AI OCR Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('historical')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'historical'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          3. Historical Profiling & ML Baseline
        </button>
      </div>

      {activeTab === 'ocr' ? (
        /* OCR & Handwritten Survey Verification Studio */
        <div className="space-y-6 animate-in fade-in">
          {/* Top Banner Explaining the 2-Stage Pipeline */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border border-amber-300 dark:border-amber-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Handwritten Paper Schedule Ingestion Workflow
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-3xl">
                  <strong className="text-amber-700 dark:text-amber-300">Architecture Flow:</strong> Handwritten paper survey scans are <em>not</em> fed directly into the ML validation model. First, our <strong>AI OCR Vision Engine</strong> recognizes digits and fields. Next, a human survey officer performs <strong>quick inline verification</strong>. Once signed off, the digitized record enters the exact same <strong>4-Tier ISDVP Quality Validation Pipeline</strong> as standard CSV/CAPI data.
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={ocrScanning}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ocrScanning ? 'animate-spin' : ''}`} />
              <span>{ocrScanning ? 'Scanning Contours...' : 'Re-Run OCR Scanner'}</span>
            </button>
          </div>

          {/* Sample Schedules Selector & Image Uploader */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {ocrPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 shadow-xs ring-1 ring-amber-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {preset.surveyName}
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold font-mono">
                    {preset.sourceType}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-2">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {preset.description}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Target Expected Result:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{preset.expectedResult.slice(0, 22)}...</span>
                </div>
              </div>
            ))}
          </div>

          {/* Side-by-Side OCR Visualizer & Human Verification Desk */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Simulated Scanned Paper Document with Bounding Boxes (5 Cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                      Scanned Survey Schedule Image (Source)
                    </span>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-all">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleCustomFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Progress bar during scan */}
                {ocrScanning && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-amber-600 font-bold mb-1">
                      <span>Analyzing handwriting contours & extracting OCR text...</span>
                      <span>{ocrProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Simulated Paper Survey Sheet Preview */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50/40 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 font-mono relative overflow-hidden text-xs">
                  {/* Paper Header */}
                  <div className="border-b border-dashed border-amber-300 dark:border-slate-700 pb-2 mb-3 text-center">
                    <span className="font-bold uppercase tracking-widest text-[10px] text-slate-500 block">
                      GOVERNMENT OF INDIA • NATIONAL STATISTICAL OFFICE
                    </span>
                    <span className="font-extrabold text-[12px] text-slate-800 dark:text-amber-400 block mt-0.5">
                      {activePreset.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      File Source: {customImageName || activePreset.rawImageName}
                    </span>
                  </div>

                  {/* Scanned Table with Glowing Bounding Boxes */}
                  <div className="space-y-2.5 text-[11px]">
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-amber-400/80 shadow-xs relative">
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                        OCR Box: State / District
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Item 1: State / District Code:</span>
                        <span className="font-bold text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          {editableFields.stateCode} / {editableFields.districtCode}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-amber-400/80 shadow-xs relative">
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                        OCR Box: Household Members
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Item 2: Household Size (Persons):</span>
                        <span className="font-bold text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          {editableFields.hhSize} persons
                        </span>
                      </div>
                    </div>

                    <div className={`p-2 rounded bg-white dark:bg-slate-900 border shadow-xs relative ${
                      confidences.hceTot < 85 ? 'border-red-400 bg-red-50/20' : 'border-amber-400/80'
                    }`}>
                      <span className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        confidences.hceTot < 85 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {confidences.hceTot < 85 ? 'Low OCR Confidence: Exp' : 'OCR Box: Expenditure'}
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Item 3: Monthly Consumer Exp (HCE):</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          ₹{editableFields.hceTot?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-amber-400/80 shadow-xs relative">
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                        OCR Box: Total Income
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Item 4: Total Declared Income:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          ₹{editableFields.incTot?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-amber-400/80 shadow-xs relative">
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                        OCR Box: Field Enumerator
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Item 5: Enumerator Badge ID:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          {editableFields.enumeratorId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-bold block text-slate-800 dark:text-white">Field Inspection Note:</span>
                {activePreset.scanNote}
              </div>
            </div>

            {/* Right Column: Human-in-the-Loop Inline Verification Desk (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                      Human-in-the-Loop Digitization & Verification Desk
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    Status: Reviewing OCR Extraction
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Review extracted fields and OCR confidence scores. You can modify any ambiguous digit before approving entry into the live validation pipeline.
                </p>

                {/* Editable Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">State Code</label>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {confidences.stateCode}% OCR Conf
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.stateCode}
                      onChange={(e) => setEditableFields({ ...editableFields, stateCode: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">District Code</label>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {confidences.districtCode}% OCR Conf
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.districtCode}
                      onChange={(e) => setEditableFields({ ...editableFields, districtCode: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Household Size</label>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {confidences.hhSize}% OCR Conf
                      </span>
                    </div>
                    <input
                      type="number"
                      value={editableFields.hhSize}
                      onChange={(e) => setEditableFields({ ...editableFields, hhSize: Number(e.target.value) })}
                      className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Sector</label>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {confidences.sector}% OCR Conf
                      </span>
                    </div>
                    <select
                      value={editableFields.sector}
                      onChange={(e) => setEditableFields({ ...editableFields, sector: e.target.value as any })}
                      className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 capitalize"
                    >
                      <option value="rural">Rural</option>
                      <option value="urban">Urban</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Monthly Expenditure (HCE ₹)</label>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        confidences.hceTot < 85
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}>
                        {confidences.hceTot}% OCR Conf
                      </span>
                    </div>
                    <input
                      type="number"
                      value={editableFields.hceTot}
                      onChange={(e) => setEditableFields({ ...editableFields, hceTot: Number(e.target.value) })}
                      className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-emerald-700 dark:text-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Monthly Income (INC ₹)</label>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {confidences.incTot}% OCR Conf
                      </span>
                    </div>
                    <input
                      type="number"
                      value={editableFields.incTot}
                      onChange={(e) => setEditableFields({ ...editableFields, incTot: Number(e.target.value) })}
                      className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Supervisor Verification Sign-off */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="human-verify-check"
                      checked={humanVerified}
                      onChange={(e) => setHumanVerified(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="human-verify-check" className="text-xs font-bold text-slate-800 dark:text-white cursor-pointer">
                      I confirm human verification of handwriting digits against the source schedule
                    </label>
                  </div>
                  <input
                    type="text"
                    value={verifierNotes}
                    onChange={(e) => setVerifierNotes(e.target.value)}
                    placeholder="Verification notes or auditor remarks..."
                    className="w-full py-1.5 px-3 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* Status Alert Banner if Ingested */}
              {ocrIngestStatus && (
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  ocrIngestStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {ocrIngestStatus.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span>{ocrIngestStatus.message}</span>
                  </div>
                  {ocrIngestStatus.flagsCount !== undefined && (
                    <Link
                      to="/app/flags"
                      className="inline-flex items-center gap-1 font-bold underline hover:no-underline shrink-0"
                    >
                      <span>View {ocrIngestStatus.flagsCount} Flags in Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}

              {/* Final Ingest Action CTA */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Target Survey: <strong className="text-slate-700 dark:text-slate-300">{activePreset.surveyName} ({activePreset.quarter})</strong>
                </div>

                <button
                  type="button"
                  disabled={!humanVerified || ocrSubmitting}
                  onClick={handleOcrIngestToPipeline}
                  id="ingest-ocr-pipeline-btn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{ocrSubmitting ? 'Ingesting to Pipeline...' : 'Approve & Ingest into Multi-Tier Pipeline'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'historical' ? (
        /* Historical Baseline Profiling View */
        <div className="space-y-6 animate-in fade-in">

          {/* Baseline Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Historical PLFS Records</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                {historicalProfile.totalTrainedRecords}
              </h3>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium block mt-1">
                Across {historicalProfile.roundsCount} Prior Survey Rounds (2024-2025)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Consumption Median (HCE)</span>
              <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                {historicalProfile.hceMedian}
              </h3>
              <span className="text-[11px] text-slate-500 block mt-1">
                IQR: {historicalProfile.hceIQR}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Income Median (INC)</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {historicalProfile.incMedian}
              </h3>
              <span className="text-[11px] text-slate-500 block mt-1">
                IQR: {historicalProfile.incIQR}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Isolation Forest Baseline</span>
              <h3 className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 mt-1">
                {historicalProfile.isolationForestBaseline.normalityBaselineScore}
              </h3>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block mt-1">
                ✓ {historicalProfile.isolationForestBaseline.status}
              </span>
            </div>
          </div>

          {/* Statistical Distribution & Correlations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Variable Distribution Parameters (Historical Baseline)
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Monthly Consumer Expenditure (HCE)</span>
                    <span className="text-[11px] text-slate-500">Mean: {historicalProfile.hceMean} · Std: {historicalProfile.hceStd}</span>
                  </div>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{historicalProfile.hceIQR}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Household Total Income (INC)</span>
                    <span className="text-[11px] text-slate-500">Mean: {historicalProfile.incMean} · Std: {historicalProfile.incStd}</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{historicalProfile.incIQR}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Household Size</span>
                    <span className="text-[11px] text-slate-500">Mean: 4.4 members · Range: 1 – 12</span>
                  </div>
                  <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">IQR: 3 – 5 persons</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Discovered Normal Relationships & Correlations
              </h3>
              <div className="space-y-3">
                {historicalProfile.correlations.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">{c.pair}</span>
                      <span className="text-[11px] text-slate-500">{c.status}</span>
                    </div>
                    <span className="font-mono text-teal-700 dark:text-teal-400 font-bold text-sm">r = +{c.coefficient}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Current Ingestion Batches View */
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Survey Type</label>
                <select
                  value={filterSurvey}
                  onChange={(e) => setFilterSurvey(e.target.value)}
                  id="survey-filter-select"
                  className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="all">All Surveys (PLFS, ASI, HCES)</option>
                  <option value="PLFS">PLFS (Labour Force)</option>
                  <option value="ASI">ASI (Annual Industries)</option>
                  <option value="HCES">HCES (Consumer Expenditure)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Validation Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  id="status-filter-select"
                  className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="all">All Statuses</option>
                  <option value="ingested">Ingested</option>
                  <option value="validated">Validated</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchBatches}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh table"
            >
              <RefreshCw className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        </div>
      )}

      {/* Batch Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Survey Name</th>
                <th className="py-3.5 px-4">Quarter / Round</th>
                <th className="py-3.5 px-4">Survey Months</th>
                <th className="py-3.5 px-4">Upload Source</th>
                <th className="py-3.5 px-4">Record Count</th>
                <th className="py-3.5 px-4">Pipeline Status</th>
                <th className="py-3.5 px-4">Ingested At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading survey batches...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No survey batches found matching filters.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-teal-700 dark:text-teal-400">
                      {b.surveyName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {b.quarter}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {b.month}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {b.uploadSource}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-white">
                      {b._count?.records || b.recordCount} records
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        b.status === 'flagged'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                          : b.status === 'validated'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenRecords(b)}
                        id={`view-records-btn-${b.id.slice(0, 4)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold transition-all text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Records</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Batch Ingestion Modal */}
      {showNewBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-base">Ingest New Survey Batch</h3>
              </div>
              <button
                onClick={() => setShowNewBatchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Survey</label>
                <select
                  value={newSurveyName}
                  onChange={(e) => setNewSurveyName(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="PLFS">Periodic Labour Force Survey (PLFS)</option>
                  <option value="HCES">Household Consumer Expenditure (HCES)</option>
                  <option value="ASI">Annual Survey of Industries (ASI)</option>
                  <option value="NFHS">National Family Health Survey (NFHS)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quarter / Round</label>
                  <input
                    type="text"
                    required
                    value={newQuarter}
                    onChange={(e) => setNewQuarter(e.target.value)}
                    placeholder="e.g. Q3-2024"
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Upload Mode</label>
                  <select
                    value={newUploadSource}
                    onChange={(e) => setNewUploadSource(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="api">eSigma CAPI Direct API</option>
                    <option value="batch">Offline Batch CSV Upload</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Survey Months Span</label>
                <input
                  type="text"
                  required
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  placeholder="e.g. Jul 2024 - Sep 2024"
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              {newUploadSource === 'batch' ? (
                /* CSV File Upload Section */
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Upload Custom Survey Dataset (.CSV)
                    </label>
                    <button
                      type="button"
                      onClick={handleDownloadSampleCsv}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline inline-flex items-center gap-1"
                    >
                      <span>📥 Download Sample CSV Template</span>
                    </button>
                  </div>

                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-900">
                    <UploadCloud className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-1" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {csvFileName ? `Selected: ${csvFileName}` : 'Click to Browse or Drag & Drop .CSV file'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Supports standard MoSPI PLFS/HCES columns (stateCode, districtCode, hhSize, hceTot, incTot...)
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileChange}
                      className="hidden"
                    />
                  </label>

                  {csvParseError && (
                    <div className="p-2 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{csvParseError}</span>
                    </div>
                  )}

                  {parsedCsvRecords.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{parsedCsvRecords.length} records parsed successfully</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ready for validation pipeline
                        </span>
                      </div>

                      {/* Mini Preview Table */}
                      <div className="max-h-28 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 font-bold sticky top-0 text-slate-600 dark:text-slate-300">
                            <tr>
                              <th className="p-1.5">File ID</th>
                              <th className="p-1.5">ST/DT</th>
                              <th className="p-1.5">HH Size</th>
                              <th className="p-1.5">Expenditure</th>
                              <th className="p-1.5">Income</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {parsedCsvRecords.slice(0, 3).map((r, idx) => (
                              <tr key={idx}>
                                <td className="p-1.5 font-mono text-teal-600">{r.fileId}</td>
                                <td className="p-1.5">{r.stateCode}/{r.districtCode}</td>
                                <td className="p-1.5">{r.hhSize}</td>
                                <td className="p-1.5 font-semibold text-emerald-600">₹{r.hceTot.toLocaleString()}</td>
                                <td className="p-1.5">₹{r.incTot.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Simulated CAPI Volume Generator Section */
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    CAPI Record Volume Generator (PLFS Scheme)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={newRecordCount}
                    onChange={(e) => setNewRecordCount(Number(e.target.value))}
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Simulates realistic PLFS state codes, household expenditure brackets, and income distributions.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBatchModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="submit-batch-btn"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {submitting
                    ? 'Ingesting & Validating...'
                    : parsedCsvRecords.length > 0
                    ? `Ingest ${parsedCsvRecords.length} CSV Records`
                    : 'Launch Ingestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Record Explorer Modal / Drawer */}
      {viewingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>Batch Record Explorer: {viewingBatch.surveyName} ({viewingBatch.quarter})</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-semibold">
                    {batchRecords.length} loaded
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed household response data and live anomaly flag status
                </p>
              </div>
              <button
                onClick={() => setViewingBatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="py-3">
              <input
                type="text"
                placeholder="Filter by File ID, State Code, or Enumerator..."
                value={recordSearch}
                onChange={(e) => setRecordSearch(e.target.value)}
                className="w-full max-w-sm py-1.5 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* Records Table */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-[#12163B] text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">File / Rec ID</th>
                    <th className="py-2.5 px-3">State / Dist</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">HH Size</th>
                    <th className="py-2.5 px-3">Consumption (HCE)</th>
                    <th className="py-2.5 px-3">Income</th>
                    <th className="py-2.5 px-3">Enumerator</th>
                    <th className="py-2.5 px-3">Flags Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recordsLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">Loading records...</td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">No records found.</td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-2.5 px-3 font-mono font-semibold text-teal-600 dark:text-teal-300">
                          {rec.fileId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          ST:{rec.stateCode} (DT:{rec.districtCode})
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-slate-400">{rec.sector}</td>
                        <td className="py-2.5 px-3 font-bold">{rec.hhSize}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{rec.hceTot?.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-2.5 px-3 font-semibold ${rec.incTot <= 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          ₹{rec.incTot?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{rec.enumeratorId}</td>
                        <td className="py-2.5 px-3">
                          {rec.flags && rec.flags.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                              <ShieldAlert className="w-3 h-3" />
                              {rec.flags.length} Flagged
                            </span>
                          ) : (
                            <span className="text-[10px] text-teal-500 font-semibold">✓ Normal</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-4 mt-2 flex justify-end">
              <button
                onClick={() => setViewingBatch(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
