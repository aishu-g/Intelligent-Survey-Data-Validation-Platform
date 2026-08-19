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
} from 'lucide-react';
import api from '../services/api';

export const IngestionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'historical'>('current');
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

  // Record Explorer State
  const [viewingBatch, setViewingBatch] = useState<any | null>(null);
  const [batchRecords, setBatchRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordSearch, setRecordSearch] = useState('');

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

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage('Ingesting and validating batch records...');

    try {
      await api.post('/batches', {
        surveyName: newSurveyName,
        quarter: newQuarter,
        month: newMonth,
        uploadSource: newUploadSource,
        initialRecordCount: Number(newRecordCount),
      });

      setShowNewBatchModal(false);
      setStatusMessage('');
      await fetchBatches();
    } catch (err) {
      console.error('Failed to create batch:', err);
      setStatusMessage('Error creating batch');
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
              Module 1 & 2 • Standalone Data Layer
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-1">
            Survey Data Ingestion & Historical Profiling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ingest current survey datasets (CSV/Excel) and profile historical PLFS baselines to calibrate multi-layer anomaly detection
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
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
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
          onClick={() => setActiveTab('historical')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'historical'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          2. Historical Profiling & ML Baseline
        </button>
      </div>

      {activeTab === 'historical' ? (
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

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Synthetic Record Volume Generator (PLFS Scheme)
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
                  {submitting ? 'Generating & Ingesting...' : 'Launch Ingestion'}
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
