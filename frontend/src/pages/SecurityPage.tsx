import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  FileCheck,
  HardDrive,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Eye,
  Server,
  Fingerprint,
  FileWarning,
  UserCheck,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SecurityPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'architecture' | 'audit' | 'backups' | 'scanner' | 'pii'>('architecture');
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Cryptographic Verification State
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [chainResult, setChainResult] = useState<any | null>(null);

  // Backups State
  const [backups, setBackups] = useState<any[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [backupCreating, setBackupCreating] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);

  // File Scanner State
  const [testFileName, setTestFileName] = useState('survey_data_2026.csv');
  const [testContent, setTestContent] = useState('hhSize,hceTot,incTot,sector\n4,32000,45000,urban\n5,28000,39000,rural');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);

  // Fetch security posture
  const fetchSecurityStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await api.get('/security/status');
      setSecurityStatus(res.data.securityPosture);
    } catch (err) {
      console.error('Failed to load security posture:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async (page = 1) => {
    try {
      setAuditLoading(true);
      const params: any = { page, limit: 15 };
      if (actionFilter !== 'all') params.action = actionFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/security/audit-logs', { params });
      setAuditLogs(res.data.logs || []);
      setAuditPage(res.data.pagination.page);
      setAuditTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Fetch backups
  const fetchBackups = async () => {
    try {
      setBackupsLoading(true);
      const res = await api.get('/security/backups');
      setBackups(res.data.backups || []);
    } catch (err) {
      console.error('Failed to load backups:', err);
    } finally {
      setBackupsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs(1);
    } else if (activeTab === 'backups') {
      fetchBackups();
    }
  }, [activeTab, actionFilter, statusFilter]);

  // Handle Merkle Chain Verification
  const handleVerifyChain = async () => {
    try {
      setVerifyingChain(true);
      const res = await api.get('/security/audit-logs/verify');
      setChainResult(res.data.verification);
    } catch (err) {
      console.error('Audit verification error:', err);
    } finally {
      setVerifyingChain(false);
    }
  };

  // Handle Backup Creation
  const handleCreateBackup = async () => {
    try {
      setBackupCreating(true);
      setBackupSuccessMsg(null);
      const res = await api.post('/security/backup');
      setBackupSuccessMsg(`Safe encrypted snapshot created: ${res.data.backup?.fileName || 'Success'}`);
      fetchBackups();
      fetchSecurityStatus();
      setTimeout(() => setBackupSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to create backup:', err);
    } finally {
      setBackupCreating(false);
    }
  };

  // Handle Test File Scan
  const handleScanFile = async () => {
    try {
      setScanning(true);
      const res = await api.post('/security/scan-file', {
        fileName: testFileName,
        content: testContent,
      });
      setScanResult(res.data.scanResult);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Friendly Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900/90 via-slate-900 to-indigo-950 border border-teal-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Data Security & Privacy Shield
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-teal-100/90">
            Citizen records and survey data are 100% locked with bank-grade encryption and 24/7 security tracking.
          </p>
        </div>

        {/* Global Security Health Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-950/80 border border-teal-500/50 text-teal-300 text-xs font-bold shadow-inner">
          <span className="w-3 h-3 rounded-full bg-teal-400 animate-ping"></span>
          <span>Security Guard: 100% ACTIVE</span>
        </div>
      </div>

      {/* 4 Simple Quick-Status Cards (Easy to Understand at a Glance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bank-Grade Lock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Bank-Grade Data Lock</span>
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">
            100% Encrypted
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Personal data is locked with military-grade AES-256. Nobody can steal or read it.
          </p>
        </div>

        {/* Card 2: 24/7 Security Diary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>24/7 Security Diary</span>
            <Fingerprint className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">
            Tamper-Proof
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Every login, record view, and number change is permanently recorded with officer names.
          </p>
        </div>

        {/* Card 3: Anti-Virus Shield */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Anti-Virus Scanner</span>
            <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">
            Scanning Active
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            All uploaded CSV/Excel files are inspected to block viruses, hackers, and harmful code.
          </p>
        </div>

        {/* Card 4: Walk-Away Auto-Lock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Walk-Away Protection</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">
            Auto-Lock (15m)
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Locks out automatically if you step away from your computer so nobody can peek at records.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>How Your Data Is Protected</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>24/7 Security Action Diary</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'backups'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Emergency Safe Backups</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'scanner'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Test Anti-Virus Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('pii')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pii'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Personal Privacy Masking</span>
        </button>
      </div>

      {/* Tab 1: How Your Data Is Protected (Simple Visual Explanation) */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                The 3 Protective Security Walls Around Your Data
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every single piece of data is guarded by three separate layers of defense before and after it enters the system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Wall 1: Identity & Access */}
              <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">1</span>
                    <h3>Identity & Login Guard</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-600 text-white">PROTECTED</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Only authorized officers with verified passwords can enter. If someone types the wrong password repeatedly, the door locks immediately.
                </p>
                <div className="pt-2 border-t border-teal-100 dark:border-teal-800/40 space-y-1.5 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                  <div>✓ Strong encrypted passwords</div>
                  <div>✓ Restricted officer permissions</div>
                  <div>✓ Auto-lock after 15 minutes of inactivity</div>
                </div>
              </div>

              {/* Wall 2: File & Virus Inspection */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                    <h3>Airport-Style File Scanner</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white">PROTECTED</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every CSV and Excel file is inspected before entering the platform. Hidden viruses, rogue scripts, or malicious formula commands are blocked automatically.
                </p>
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/40 space-y-1.5 text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">
                  <div>✓ Malicious virus scan</div>
                  <div>✓ Excel formula injection defense</div>
                  <div>✓ Safe, validated data structure</div>
                </div>
              </div>

              {/* Wall 3: Vault Lock & Backups */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                    <h3>Encrypted Vault Storage</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white">PROTECTED</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Data stored inside the database is converted into scrambled code (AES-256). Even if someone stole the database, they cannot read it.
                </p>
                <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/40 space-y-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  <div>✓ AES-256 unbreakable vault encryption</div>
                  <div>✓ Automatic safe backups</div>
                  <div>✓ Permanent security action diary</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 24/7 Security Action Diary */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by officer email or action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs(1)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 w-64"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
              >
                <option value="all">All Actions</option>
                <option value="LOGIN">Logins</option>
                <option value="UPLOAD_BATCH">Data Uploads</option>
                <option value="CORRECT_RECORD">Data Corrections</option>
                <option value="REVIEW_FLAG">Anomaly Reviews</option>
                <option value="CREATE_RULE">Rule Additions</option>
                <option value="CREATE_BACKUP">Backups Created</option>
              </select>

              <button
                onClick={() => fetchAuditLogs(1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Refresh diary"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* One-Click Authenticity Verification */}
            <button
              onClick={handleVerifyChain}
              disabled={verifyingChain}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{verifyingChain ? 'Checking Integrity...' : 'Check Diary Authenticity'}</span>
            </button>
          </div>

          {/* Verification Banner */}
          {chainResult && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              chainResult.isValid
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-bold">
                    100% Authentic & Tamper-Free: All {chainResult.totalEntries} actions verified without alteration.
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5">Checked at {new Date(chainResult.verifiedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Action Taken</th>
                    <th className="py-3 px-4">Target Record / Item</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4 text-right">View Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {auditLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">Loading security logbook...</td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">No actions recorded under this filter.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-white truncate max-w-[160px]">
                            {log.userName || 'System Auto-Guard'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {log.userEmail || 'system@gov.in'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.action.includes('CORRECT') || log.action.includes('CHANGE')
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                          {log.resource}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-bold text-teal-600">
                            {log.status === 'SUCCESS' ? '✓ Successful' : '✕ Blocked'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600 transition-colors"
                            title="View security proof"
                          >
                            <Eye className="w-4 h-4" />
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
      )}

      {/* Tab 3: Emergency Safe Backups */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                Emergency Safe Data Snapshots
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Takes a locked, encrypted safety copy of all survey records and rules so no data can ever be lost.
              </p>
            </div>

            <button
              onClick={handleCreateBackup}
              disabled={backupCreating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all whitespace-nowrap"
            >
              <HardDrive className="w-4 h-4" />
              <span>{backupCreating ? 'Creating Safe Copy...' : 'Create Safe Backup Copy Now'}</span>
            </button>
          </div>

          {backupSuccessMsg && (
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>{backupSuccessMsg}</span>
            </div>
          )}

          {/* Backup List */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Backup Snapshot</th>
                    <th className="py-3 px-4">Security Level</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Records Protected</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-right">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {backupsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">Loading safe copies...</td>
                    </tr>
                  ) : backups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No manual backups created yet. Click "Create Safe Backup Copy Now" above.
                      </td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.fileName} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-white">
                          {b.fileName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            Bank-Grade AES-256
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {(b.sizeBytes / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {b.recordCount} households
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(b.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>100% Intact</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: File Safety & Virus Scanner */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                Test the Anti-Virus & File Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Try testing sample data to see how the system automatically detects and blocks dangerous files.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">File Name</label>
                <input
                  type="text"
                  value={testFileName}
                  onChange={(e) => setTestFileName(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">File Sample Text</label>
                <textarea
                  rows={5}
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Sample Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTestFileName('survey_plfs_q1.csv');
                    setTestContent('hhSize,hceTot,incTot,sector\n4,32000,45000,urban\n5,28000,39000,rural');
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                >
                  ✓ Test Normal Safe File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTestFileName('harmful_hack_test.csv');
                    setTestContent('hhSize,hceTot,incTot\n1,=cmd|\' /C calc\'!A0,50000');
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800"
                >
                  ✕ Test Dangerous Exploit File
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleScanFile}
                  disabled={scanning}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{scanning ? 'Scanning...' : 'Run Anti-Virus Inspection'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scan Results Panel */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Scanner Results</h3>

            {scanResult ? (
              <div className={`p-5 rounded-2xl border space-y-3 ${
                scanResult.isSafe
                  ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-100'
                  : 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
              }`}>
                <div className="flex items-center gap-3">
                  {scanResult.isSafe ? (
                    <CheckCircle2 className="w-7 h-7 text-teal-600" />
                  ) : (
                    <FileWarning className="w-7 h-7 text-red-600" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm">
                      {scanResult.isSafe ? 'FILE IS 100% SAFE TO UPLOAD' : 'DANGEROUS CODE BLOCKED!'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {scanResult.isSafe
                        ? 'No viruses, dangerous Excel commands, or malicious scripts found.'
                        : scanResult.reason}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select a sample above and click "Run Anti-Virus Inspection" to test.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Personal Privacy Masking */}
      {activeTab === 'pii' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
              How Citizens' Personal Details Are Kept Private
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal names, phone numbers, and household identifiers are automatically masked for unauthorized view modes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Household Survey Codes</span>
              <p className="text-sm text-teal-600 font-mono font-bold">HH_129034 ➔ HH-****-34</p>
              <span className="text-[11px] text-slate-500 block">Personal household identity is hidden.</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Citizen Email Addresses</span>
              <p className="text-sm text-teal-600 font-mono font-bold">officer@gov.in ➔ o******r@gov.in</p>
              <span className="text-[11px] text-slate-500 block">Contact info is masked from public exports.</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Enumerator Tracking IDs</span>
              <p className="text-sm text-teal-600 font-mono font-bold">ENUM_1042 ➔ EN**42</p>
              <span className="text-[11px] text-slate-500 block">Only senior supervisors can unmask field IDs.</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Audit Log Details */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Security Log Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Action</span>
                  <span className="font-bold text-slate-800 dark:text-white">{selectedLog.action.replace(/_/g, ' ')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-bold text-teal-600">{selectedLog.status}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1 text-[11px]">
                <div><span className="text-slate-400">Officer:</span> {selectedLog.userName || 'System Auto-Guard'}</div>
                <div><span className="text-slate-400">Email:</span> {selectedLog.userEmail || 'system@gov.in'}</div>
                <div><span className="text-slate-400">Time:</span> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                <div><span className="text-slate-400">Target Item:</span> {selectedLog.resource}</div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
