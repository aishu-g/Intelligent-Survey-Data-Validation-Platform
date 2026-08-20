import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../services/api';
import { exportToCsv } from '../utils/exportCsv';
import { DetailDrawer } from '../components/DetailDrawer';

export const FlagsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [flags, setFlags] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [severity, setSeverity] = useState(searchParams.get('severity') || 'all');
  const [riskBand, setRiskBand] = useState('all');
  const [method, setMethod] = useState(searchParams.get('method') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'open');
  const [batchId, setBatchId] = useState('all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Expanded Rows & Selection
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDrawerFlag, setSelectedDrawerFlag] = useState<any | null>(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (severity !== 'all') params.severity = severity;
      if (method !== 'all') params.detectionMethod = method;
      if (status !== 'all') params.status = status;
      if (batchId !== 'all') params.batchId = batchId;

      const res = await api.get('/flags', { params });
      setFlags(res.data.flags || []);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error fetching flags:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data.batches || []);
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    const sevParam = searchParams.get('severity');
    if (sevParam) setSeverity(sevParam);
    const statusParam = searchParams.get('status');
    if (statusParam) setStatus(statusParam);
    const methodParam = searchParams.get('method');
    if (methodParam) setMethod(methodParam);
  }, [searchParams]);

  useEffect(() => {
    fetchFlags();
  }, [severity, method, status, batchId]);


  const handleUpdateStatus = async (flagId: string, newStatus: string, notes?: string) => {
    try {
      await api.patch(`/flags/${flagId}`, { status: newStatus, notes });
      setSelectedDrawerFlag(null);
      await fetchFlags();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleBulkReview = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/flags/bulk', { ids: selectedIds, status: newStatus });
      await fetchFlags();
    } catch (err) {
      console.error('Bulk update failed:', err);
    }
  };

  const handleExportCsv = () => {
    const dataToExport = filteredFlags.map((f) => ({
      flag_id: f.id,
      record_id: f.record?.fileId || f.recordId,
      survey: f.record?.batch?.surveyName,
      quarter: f.record?.batch?.quarter,
      state_code: f.record?.stateCode,
      district_code: f.record?.districtCode,
      hh_size: f.record?.hhSize,
      consumption_hce: f.record?.hceTot,
      income_inc: f.record?.incTot,
      sector: f.record?.sector,
      enumerator: f.record?.enumeratorId,
      detection_method: f.detectionMethod,
      anomaly_score: f.anomalyScore,
      severity: f.severity,
      explanation_text: f.explanationText,
      status: f.status,
      flagged_date: f.createdAt,
    }));
    exportToCsv(`isdvp_flagged_anomalies_${Date.now()}`, dataToExport);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFlags.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFlags.map((f) => f.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      !searchTerm ||
      f.record?.fileId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.record?.enumeratorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.explanationText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.record?.stateCode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (riskBand === 'critical') return f.anomalyScore >= 80;
    if (riskBand === 'high') return f.anomalyScore >= 60 && f.anomalyScore < 80;
    if (riskBand === 'medium') return f.anomalyScore >= 30 && f.anomalyScore < 60;
    if (riskBand === 'low') return f.anomalyScore < 30;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Supervisor Anomaly Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Triaging multi-layer 5-engine violations: Rule-based, Statistical, Historical, Enumerator, and Isolation Forest
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            id="export-flags-csv-btn"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-500" />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Bulk Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Risk Band (0-100)</label>
              <select
                value={riskBand}
                onChange={(e) => setRiskBand(e.target.value)}
                id="flag-risk-band-filter"
                className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="all">All Risk Bands</option>
                <option value="critical">Critical Review (80-100)</option>
                <option value="high">High Attention (60-80)</option>
                <option value="medium">Medium Review (30-60)</option>
                <option value="low">Low Risk (0-30)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Validation Engine</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                id="flag-method-filter"
                className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="all">All 5 Engines</option>
                <option value="rule">4.1 Rule-Based</option>
                <option value="statistical">4.2 Statistical (IQR / Z-Score)</option>
                <option value="historical">4.3 Historical & Drift</option>
                <option value="enumerator">4.4 Enumerator Behavioral</option>
                <option value="ml">4.5 Isolation Forest ML</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Supervisor Review Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                id="flag-status-filter"
                className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open / Pending Review</option>
                <option value="verified_valid">Verified as Valid</option>
                <option value="resolved">Corrected & Resolved</option>
                <option value="escalated">Escalated for Review</option>
                <option value="investigation">Under Investigation</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Survey Batch</label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 max-w-[180px] truncate"
              >
                <option value="all">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.surveyName} - {b.quarter}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reasoning, enumerator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-1.5 pl-8 pr-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 w-48 sm:w-64"
              />
            </div>
            <button
              onClick={fetchFlags}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between animate-in fade-in">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {selectedIds.length} flags selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkReview('verified_valid')}
                id="bulk-verify-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify Selected as Valid</span>
              </button>
              <button
                onClick={() => handleBulkReview('reviewed')}
                id="bulk-review-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mark as Reviewed</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flag Queue List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    {selectedIds.length > 0 && selectedIds.length === filteredFlags.length ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Survey Batch</th>
                <th className="py-3 px-4">Engine</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">SHAP Explainability Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">Loading flag queue...</td>
                </tr>
              ) : filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">No anomaly flags matching filter criteria.</td>
                </tr>
              ) : (
                filteredFlags.map((flag) => {
                  const isExpanded = expandedRowId === flag.id;
                  const isSelected = selectedIds.includes(flag.id);
                  const record = flag.record;

                  return (
                    <React.Fragment key={flag.id}>
                      <tr
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isSelected ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <button onClick={() => toggleSelectOne(flag.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : flag.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Expand record details"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <span>{record?.fileId || flag.recordId.slice(0, 8)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-800 dark:text-slate-300 font-medium">
                          {record?.batch?.surveyName} <span className="text-[10px] text-slate-400">({record?.batch?.quarter})</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {flag.detectionMethod}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                            flag.severity === 'high'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                              : flag.severity === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                          }`}>
                            {flag.severity}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {Math.round(flag.anomalyScore)}%
                        </td>

                        <td
                          className="py-3 px-4 max-w-sm cursor-pointer text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400"
                          onClick={() => setSelectedDrawerFlag(flag)}
                          title="Click for full investigation drawer"
                        >
                          <p className="line-clamp-2 leading-relaxed">{flag.explanationText}</p>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`capitalize font-semibold text-[11px] ${
                            flag.status === 'open'
                              ? 'text-amber-600 dark:text-amber-400'
                              : flag.status === 'resolved' || flag.status === 'verified_valid'
                              ? 'text-teal-700 dark:text-teal-400'
                              : 'text-slate-500'
                          }`}>
                            ● {flag.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleUpdateStatus(flag.id, 'verified_valid')}
                            id={`verify-btn-${flag.id.slice(0, 4)}`}
                            className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-colors"
                            title="Verify as Valid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDrawerFlag(flag)}
                            id={`details-btn-${flag.id.slice(0, 4)}`}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 font-bold text-[11px] transition-colors"
                          >
                            Review & Correct
                          </button>
                        </td>
                      </tr>

                      {/* Expandable In-line Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/60">
                          <td colSpan={9} className="p-4 border-l-4 border-teal-600">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Location</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  State Code {record?.stateCode} · District {record?.districtCode}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Household Size</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {record?.hhSize} Persons ({record?.sector})
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Monthly Consumption</span>
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                  ₹{record?.hceTot?.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Declared Income</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  ₹{record?.incTot?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <DetailDrawer
        flag={selectedDrawerFlag}
        onClose={() => setSelectedDrawerFlag(null)}
        onUpdateStatus={handleUpdateStatus}
        onRecordUpdated={fetchFlags}
      />
    </div>
  );
};
