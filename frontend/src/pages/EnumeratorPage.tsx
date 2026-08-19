import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Search,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
  SlidersHorizontal,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

export const EnumeratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [enumerators, setEnumerators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const fetchEnumerators = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/enumerators');
      setEnumerators(res.data.enumerators || []);
    } catch (err) {
      console.error('Failed to fetch enumerator profiling:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnumerators();
  }, []);

  const filtered = enumerators.filter((e) => {
    const matchesSearch =
      e.enumeratorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.peerDeviation.toLowerCase().includes(searchTerm.toLowerCase());

    if (riskFilter === 'high') return matchesSearch && (e.status === 'High Review Risk' || e.anomalyRate > 35);
    if (riskFilter === 'normal') return matchesSearch && e.status === 'Satisfactory';
    return matchesSearch;
  });

  const totalActive = enumerators.length;
  const highRiskCount = enumerators.filter((e) => e.status === 'High Review Risk').length;
  const avgVariation =
    enumerators.length > 0
      ? Math.round(enumerators.reduce((s, e) => s + e.responseVariationIndex, 0) / enumerators.length)
      : 42;
  const totalFlagsAttributed = enumerators.reduce((s, e) => s + e.flaggedRecords, 0);

  const chartData = enumerators.slice(0, 10).map((e) => ({
    name: e.enumeratorId,
    anomalyRate: e.anomalyRate,
    variation: e.responseVariationIndex,
    heaping: e.digitHeapingRate,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
              Module 4.4 • Behavioral Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Field Enumerator & Cluster Behavioral Profiling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Detecting response variation anomalies, low-entropy fabrications, digit heaping, and peer-group deviations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEnumerators}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-teal-500" />
            <span>Refresh Profiling</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Enumerators</span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{totalActive}</h3>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Survey Coverage
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800 flex items-center justify-center">
            <Users className="w-6 h-6 text-teal-700 dark:text-teal-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">High Review Risk</span>
            <h3 className="text-2xl font-extrabold text-red-700 dark:text-red-400 mt-1">{highRiskCount}</h3>
            <span className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Low entropy / clustered
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Mean Variation Index</span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{avgVariation}%</h3>
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <Activity className="w-3.5 h-3.5 text-slate-600" /> Baseline: &gt; 25% CV
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Attributed Anomaly Flags</span>
            <h3 className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{totalFlagsAttributed}</h3>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5" /> Across current batches
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800 flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Visual Behavioral Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Top Enumerator Anomaly Rates vs Response Variation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Low variation (&lt;20%) coupled with high anomaly rate indicates possible synthetic response entry
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="anomalyRate" name="Anomaly Rate %" fill="#B91C1C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="variation" name="Response Variation Index" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Digit Heaping & Rounding Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High percentage of income/expenditure ending in rounded 000s or 500s suggests unmeasured estimation
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="heaping" name="Digit Heaping % (Rounded Entries)" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Enumerator Table & Filter */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search enumerator code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-1.5 pl-8 pr-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 w-56"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Risk Categories</option>
              <option value="high">High Review Risk Only</option>
              <option value="normal">Satisfactory Only</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Enumerator ID</th>
                  <th className="py-3 px-4">Total Records</th>
                  <th className="py-3 px-4">Flagged / High Risk</th>
                  <th className="py-3 px-4">Anomaly Rate</th>
                  <th className="py-3 px-4">Response Variation Index</th>
                  <th className="py-3 px-4">Digit Heaping</th>
                  <th className="py-3 px-4">Peer Deviation Signal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">Loading enumerator profiles...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">No enumerators match criteria.</td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.enumeratorId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                        {e.enumeratorId}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                        {e.totalRecords}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{e.flaggedRecords}</span>
                        {e.highRiskCount > 0 && (
                          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 font-bold">
                            {e.highRiskCount} critical
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${e.anomalyRate > 35 ? 'text-red-700 dark:text-red-400' : e.anomalyRate > 20 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {e.anomalyRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${e.responseVariationIndex < 20 ? 'bg-red-600' : 'bg-teal-600'}`}
                              style={{ width: `${e.responseVariationIndex}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-500">{e.responseVariationIndex}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {e.digitHeapingRate}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-medium ${
                          e.peerDeviation.includes('Low Variance') ? 'text-red-700 dark:text-red-400' : e.peerDeviation.includes('Clustered') ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500'
                        }`}>
                          {e.peerDeviation}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          e.status === 'High Review Risk'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                            : e.status === 'Elevated Risk'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/app/flags?search=${e.enumeratorId}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-[11px] transition-colors"
                        >
                          <span>Triage Flags</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnumeratorPage;
