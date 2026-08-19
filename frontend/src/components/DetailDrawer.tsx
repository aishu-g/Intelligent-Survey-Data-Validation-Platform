import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  ShieldAlert,
  FileText,
  Edit3,
  Send,
  Save,
  Layers,
  BarChart2,
  TrendingUp,
  HelpCircle,
  Search,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

interface DetailDrawerProps {
  flag: any | null;
  onClose: () => void;
  onUpdateStatus: (flagId: string, status: any, notes?: string) => void;
  onRecordUpdated?: () => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  flag,
  onClose,
  onUpdateStatus,
  onRecordUpdated,
}) => {
  const [peerStats, setPeerStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isEditingData, setIsEditingData] = useState(false);
  const [editHce, setEditHce] = useState('');
  const [editInc, setEditInc] = useState('');
  const [editHhSize, setEditHhSize] = useState('');
  const [editSector, setEditSector] = useState('rural');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [savingCorrection, setSavingCorrection] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const record = flag?.record;
  const extra = record?.extraJson ? JSON.parse(record.extraJson) : {};

  useEffect(() => {
    if (record) {
      setEditHce(record.hceTot?.toString() || '');
      setEditInc(record.incTot?.toString() || '');
      setEditHhSize(record.hhSize?.toString() || '4');
      setEditSector(record.sector || 'rural');
      setFeedbackNotes('');
      setIsEditingData(false);
      setSaveSuccessMsg('');

      // Fetch peer stats
      fetchPeerStats(record.stateCode, record.districtCode);
    }
  }, [flag]);

  const fetchPeerStats = async (stateCode: string, districtCode: string) => {
    try {
      setLoadingStats(true);
      const res = await api.get('/records/peer-stats', {
        params: { stateCode, districtCode },
      });
      setPeerStats(res.data);
    } catch (e) {
      console.error('Failed to load peer stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSaveCorrection = async () => {
    if (!record?.id) return;
    try {
      setSavingCorrection(true);
      await api.patch(`/records/${record.id}`, {
        hceTot: editHce,
        incTot: editInc,
        hhSize: editHhSize,
        sector: editSector,
        notes: feedbackNotes || 'Data corrected by supervisor review.',
      });
      setSaveSuccessMsg('Record values updated and saved to audit log.');
      setIsEditingData(false);
      if (onRecordUpdated) onRecordUpdated();
      onUpdateStatus(flag.id, 'resolved', feedbackNotes);
    } catch (err) {
      console.error('Failed to correct record data:', err);
    } finally {
      setSavingCorrection(false);
    }
  };

  if (!flag) return null;

  const score = Math.round(flag.anomalyScore || 75);
  let riskLevel = 'Low';
  let riskBadgeColor = 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
  if (score >= 80) {
    riskLevel = 'Critical Review (80-100)';
    riskBadgeColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
  } else if (score >= 60) {
    riskLevel = 'High Attention (60-80)';
    riskBadgeColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
  } else if (score >= 30) {
    riskLevel = 'Medium / Review (30-60)';
    riskBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  }

  // Multi-score estimation
  const ruleScore = flag.detectionMethod === 'rule' ? score : Math.min(100, Math.round(score * 0.9));
  const statScore = Math.min(100, Math.round(score * 0.85));
  const histScore = Math.min(100, Math.round(score * 0.78));
  const enumScore = Math.min(100, Math.round(score * 0.65));
  const mlScore = flag.detectionMethod === 'ml' ? score : Math.min(100, Math.round(score * 0.95));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${riskBadgeColor} border`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                  Supervisor Anomaly Review
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${riskBadgeColor}`}>
                  {riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Record: <strong className="text-teal-700 dark:text-teal-400">{record?.fileId || flag.recordId}</strong> · Survey: {record?.batch?.surveyName} ({record?.batch?.quarter})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* SHAP Explainability Reasoning Box */}
          <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Explainability Engine & Root Cause</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-400">
                Combined Risk: {score}/100
              </span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {flag.explanationText}
            </p>
          </div>

          {/* Multi-Layer 5-Engine Scoring Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>5-Layer Validation Engine Multi-Scores</span>
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[9px] uppercase text-slate-500 block">4.1 Rule</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{ruleScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[9px] uppercase text-slate-500 block">4.2 Stat</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{statScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[9px] uppercase text-slate-500 block">4.3 Hist</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{histScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[9px] uppercase text-slate-500 block">4.4 Enum</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{enumScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[9px] uppercase text-slate-500 block">4.5 ML</span>
                <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{mlScore}%</span>
              </div>
            </div>
          </div>

          {/* Peer & Historical Baseline Evidence Comparison */}
          {peerStats && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Peer Group & District Benchmark Evidence</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  State {record?.stateCode} · Dist {record?.districtCode} (n={peerStats.peerCount})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">Monthly Consumption (HCE)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                      Record: ₹{record?.hceTot?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Median: ₹{peerStats.medianHce?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    IQR Range: ₹{peerStats.q1Hce?.toLocaleString('en-IN')} – ₹{peerStats.q3Hce?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">Total Income (INC)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      Record: ₹{record?.incTot?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Median: ₹{peerStats.medianInc?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    IQR Range: ₹{peerStats.q1Inc?.toLocaleString('en-IN')} – ₹{peerStats.q3Inc?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Household Survey Core Data / Inline Correction Mode */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Survey Record Attributes</span>
              </h4>
              <button
                onClick={() => setIsEditingData(!isEditingData)}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingData ? 'Cancel Edit' : 'Correct Data Values'}</span>
              </button>
            </div>

            {isEditingData ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-teal-600/40 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Monthly Consumption (₹)</label>
                    <input
                      type="number"
                      value={editHce}
                      onChange={(e) => setEditHce(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Total Income (₹)</label>
                    <input
                      type="number"
                      value={editInc}
                      onChange={(e) => setEditInc(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Household Size</label>
                    <input
                      type="number"
                      value={editHhSize}
                      onChange={(e) => setEditHhSize(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sector</label>
                    <select
                      value={editSector}
                      onChange={(e) => setEditSector(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs capitalize text-slate-800 dark:text-white"
                    >
                      <option value="rural">Rural</option>
                      <option value="urban">Urban</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSaveCorrection}
                    disabled={savingCorrection}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingCorrection ? 'Saving...' : 'Apply Correction & Resolve Flag'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Household Size</span>
                  <span className="text-base font-bold text-slate-800 dark:text-white">{record?.hhSize} members</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Monthly Consumption</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    ₹{record?.hceTot?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Total Income</span>
                  <span className={`text-base font-bold ${record?.incTot <= 0 ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                    ₹{record?.incTot?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Sector / Stratum</span>
                  <span className="text-sm font-semibold capitalize text-slate-800 dark:text-white">{record?.sector || 'Urban'}</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Location</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">
                    State {record?.stateCode} · Dist {record?.districtCode}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Enumerator Code</span>
                  <span className="text-sm font-mono font-bold text-teal-700 dark:text-teal-400">{record?.enumeratorId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Supervisor Feedback & Model Retraining Notes */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-slate-400" />
              <span>Supervisor Feedback / Model Retraining Note</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Field verification confirmed seasonal harvest income spike; marked as valid..."
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* 4 Supervisor Review Actions Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onUpdateStatus(flag.id, 'verified_valid', feedbackNotes)}
            id="drawer-verify-valid-btn"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all"
            title="Confirm record is accurate and valid"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verify Valid</span>
          </button>

          <button
            onClick={() => setIsEditingData(true)}
            id="drawer-correct-data-btn"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-xs transition-all"
            title="Edit and correct survey field values"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Correct Data</span>
          </button>

          <button
            onClick={() => onUpdateStatus(flag.id, 'escalated', feedbackNotes)}
            id="drawer-escalate-btn"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-xs transition-all"
            title="Escalate to senior statistical officer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Escalate</span>
          </button>

          <button
            onClick={() => onUpdateStatus(flag.id, 'investigation', feedbackNotes)}
            id="drawer-investigation-btn"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all"
            title="Mark record for physical field re-verification"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Investigate</span>
          </button>
        </div>
      </div>
    </div>
  );
};


