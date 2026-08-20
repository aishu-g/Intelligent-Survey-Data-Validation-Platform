import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  AlertTriangle,
  ShieldAlert,
  FileCheck2,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Filter,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import api from '../services/api';
import { DetailDrawer } from '../components/DetailDrawer';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/kpis');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const handleUpdateStatus = async (flagId: string, status: 'reviewed' | 'resolved' | 'false_positive') => {
    try {
      await api.patch(`/flags/${flagId}`, { status });
      setSelectedFlag(null);
      await fetchKpis(); // Refresh all live KPIs and charts immediately
    } catch (err) {
      console.error('Error updating flag status:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-300 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-28 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-72 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentFlags = data?.recentFlags || [];

  const totalRecords = kpis.totalRecords || 0;
  const totalFlags = kpis.totalFlags || 0;
  const validRecords = Math.max(0, totalRecords - totalFlags);
  const highRiskFlags = kpis.highFlags || 0;
  const activeRules = kpis.activeRules || 0;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
              Module 7 • Supervisor Intelligence Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Executive Survey Quality & Supervisor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time validation telemetry across Periodic Labour Force Surveys (PLFS) & National Inquiry Batches
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchKpis}
            id="refresh-dashboard-btn"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-500" />
            <span>Refresh Telemetry</span>
          </button>
          <Link
            to="/app/flags"
            id="quick-triage-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-all"
          >
            <span>Open Flag Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Core Supervisor KPI Tiles */}
      {/* 4 Core Supervisor KPI Tiles (Interactive Navigation Links) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Records -> Ingestion & Batches */}
        <Link
          to="/app/ingestion"
          id="kpi-total-records-card"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/70 hover:shadow-md transition-all group block relative overflow-hidden"
          title="Click to view all ingested survey batches & records"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Total Records
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalRecords.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-teal-700 dark:text-teal-400 font-medium">Ingested PLFS Batches</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View All →</span>
            </div>
          </div>
        </Link>

        {/* KPI 2: Valid Records -> Reports & Clean Data Export */}
        <Link
          to="/app/reports"
          id="kpi-valid-records-card"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/70 hover:shadow-md transition-all group block relative overflow-hidden"
          title="Click to view validated clean records & export reports"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Valid Records
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {validRecords.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 100}% Clean Pass Rate
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View Reports →</span>
            </div>
          </div>
        </Link>

        {/* KPI 3: Flagged Records -> All Anomaly Flags */}
        <Link
          to="/app/flags?status=all"
          id="kpi-flagged-records-card"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/70 hover:shadow-md transition-all group block relative overflow-hidden"
          title="Click to open full anomaly flag queue"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Flagged Records
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {totalFlags.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Multi-Layer Signals Detected</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Open Queue →</span>
            </div>
          </div>
        </Link>

        {/* KPI 4: High-Risk Critical Records -> High Severity Anomaly Flags */}
        <Link
          to="/app/flags?severity=high&status=open"
          id="kpi-high-risk-records-card"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-500/70 hover:shadow-md transition-all group block relative overflow-hidden"
          title="Click to triage critical high-risk records immediately"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              Critical High Risk
            </span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-red-700 dark:text-red-400">
              {highRiskFlags.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-red-600 dark:text-red-400 font-medium">Score 80–100 · Immediate Action</span>
              <span className="text-red-600 dark:text-red-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Triage High Risk →</span>
            </div>
          </div>
        </Link>
      </div>


      {/* Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity & Engine Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Validation Engine Violations Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rule-based vs Statistical vs ML Isolation Forest detections</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">5-Engine Multi-Tier</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.methods?.map((m: any) => ({
                name: m.method === 'rule' ? '4.1 Rule' : m.method === 'ml' ? '4.5 ML Forest' : '4.2-4.4 Stat/Hist',
                count: m.count,
              })) || charts.severity || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#0D9488' }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Flags Trend LineChart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Flag Ingestion & Supervisor Review Velocity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly rate of anomaly generation vs officer review actions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">Supervisor Trajectory</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.timeline || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="flags" name="Anomalies Raised" stroke="#B91C1C" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" name="Supervisor Verified/Resolved" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Flags Triage Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <span>Recent Anomaly Flags</span>
              <span className="text-xs font-normal text-slate-500">(Click any row to open quick triage drawer)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest items flagged by rules or ML detection engines
            </p>
          </div>

          <Link
            to="/app/flags"
            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Roster ({kpis.totalFlags || 0})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[11px] bg-slate-50 dark:bg-slate-800/50">
                <th className="py-3 px-3">Record ID</th>
                <th className="py-3 px-3">Survey & Batch</th>
                <th className="py-3 px-3">Detection Method</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Anomaly Score</th>
                <th className="py-3 px-3">SHAP Explanation</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentFlags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No recent flags found.
                  </td>
                </tr>
              ) : (
                recentFlags.map((flag: any) => (
                  <tr
                    key={flag.id}
                    onClick={() => setSelectedFlag(flag)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {flag.record?.fileId || flag.recordId.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-300 font-medium">
                      {flag.record?.batch?.surveyName} <span className="text-slate-400 font-mono text-[10px]">({flag.record?.batch?.quarter})</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {flag.detectionMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {Math.round(flag.anomalyScore)}%
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {flag.explanationText}
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFlag(flag);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold transition-all text-[11px]"
                      >
                        Triage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Detail Drawer */}
      <DetailDrawer
        flag={selectedFlag}
        onClose={() => setSelectedFlag(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
