import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Download,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { generateAuditPdfReport } from '../utils/exportPdf';
import { exportToCsv } from '../utils/exportCsv';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('PLFS Data Quality & Anomaly Triage Audit');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      const bList = res.data.batches || [];
      setBatches(bList);
      if (bList.length > 0 && !selectedBatchId) {
        setSelectedBatchId(bList[0].id);
      }
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchBatches();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      // Fetch batch and flags data for the real export
      const batchRes = await api.get(`/batches/${selectedBatchId}`);
      const flagsRes = await api.get(`/flags?batchId=${selectedBatchId}&limit=50`);

      const batch = batchRes.data.batch;
      const flags = flagsRes.data.flags || [];

      if (reportFormat === 'pdf') {
        generateAuditPdfReport(
          reportTitle,
          {
            surveyName: batch.surveyName,
            quarter: batch.quarter,
            recordCount: batch.recordCount || 100,
          },
          flags,
          user?.name || 'MoSPI Statistical Officer'
        );
      } else {
        const rows = flags.map((f: any) => ({
          flag_id: f.id,
          file_id: f.record?.fileId,
          method: f.detectionMethod,
          severity: f.severity,
          score: f.anomalyScore,
          status: f.status,
          explanation: f.explanationText,
        }));
        exportToCsv(reportTitle.toLowerCase().replace(/\s+/g, '_'), rows);
      }

      // Record in backend database
      await api.post('/reports', {
        title: reportTitle,
        batchId: selectedBatchId,
        format: reportFormat,
      });

      setShowModal(false);
      await fetchReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      r.title?.toLowerCase().includes(s) ||
      r.batch?.surveyName?.toLowerCase().includes(s) ||
      r.generatedBy?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Executive Reports & Audit Documentation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate formal MoSPI/NSO data quality audit certifications and granular CSV anomaly exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            id="generate-report-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Executive Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by title or survey..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1.5 pl-8 pr-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
          />
        </div>

        <button
          onClick={fetchReports}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          title="Refresh reports"
        >
          <RefreshCw className="w-4 h-4 text-teal-600" />
        </button>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Report Title</th>
                <th className="py-3.5 px-4">Survey Batch</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Author / Officer</th>
                <th className="py-3.5 px-4">Generated Timestamp</th>
                <th className="py-3.5 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Loading generated reports...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No reports generated yet.</td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {report.format === 'pdf' ? (
                        <FileText className="w-4 h-4 text-red-700 dark:text-red-400" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      )}
                      <span>{report.title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-300 font-medium">
                      {report.batch?.surveyName} <span className="text-[10px] text-slate-400">({report.batch?.quarter})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded border ${
                        report.format === 'pdf'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                          : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                      }`}>
                        {report.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-300 font-medium">
                      {report.generatedBy?.name || 'Authorized Officer'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={async () => {
                          const flagsRes = await api.get(`/flags?batchId=${report.batchId}&limit=50`);
                          const flags = flagsRes.data.flags || [];
                          if (report.format === 'pdf') {
                            generateAuditPdfReport(
                              report.title,
                              {
                                surveyName: report.batch?.surveyName || 'PLFS',
                                quarter: report.batch?.quarter || 'Q1',
                                recordCount: report.batch?.recordCount || 100,
                              },
                              flags,
                              report.generatedBy?.name || 'Officer'
                            );
                          } else {
                            const rows = flags.map((f: any) => ({
                              flag_id: f.id,
                              file_id: f.record?.fileId,
                              method: f.detectionMethod,
                              severity: f.severity,
                              score: f.anomalyScore,
                              status: f.status,
                              explanation: f.explanationText,
                            }));
                            exportToCsv(report.title.toLowerCase().replace(/\s+/g, '_'), rows);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold transition-all text-[11px]"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export Again</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-base">Generate Survey Audit Report</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Report Document Title</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Survey Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  required
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.surveyName} — {b.quarter} ({b.month})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Output Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReportFormat('pdf')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      reportFormat === 'pdf'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-rose-400" />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Official PDF Audit</span>
                      <span className="text-[10px] text-slate-400">Formatted for MoSPI / NSO</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportFormat('csv')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      reportFormat === 'csv'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Granular CSV Data</span>
                      <span className="text-[10px] text-slate-400">Machine-readable roster</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  id="modal-generate-btn"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {generating ? 'Compiling Document...' : 'Generate & Download'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
