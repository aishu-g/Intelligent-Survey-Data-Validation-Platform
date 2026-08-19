import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Plus,
  Play,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';
import api from '../services/api';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{ message: string; newFlags: number } | null>(null);

  // New Rule Modal State
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('cross_field');
  const [fieldName, setFieldName] = useState('hceTot');
  const [operator, setOperator] = useState('ratio_gt_inc_3');
  const [value, setValue] = useState('3.0');
  const [severity, setSeverity] = useState('high');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Modal
  const [ruleToDelete, setRuleToDelete] = useState<any | null>(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rules');
      setRules(res.data.rules || []);
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleActive = async (rule: any) => {
    try {
      const newStatus = !rule.isActive;
      await api.patch(`/rules/${rule.id}`, { isActive: newStatus });
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, isActive: newStatus } : r))
      );
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleRunRule = async (ruleId: string) => {
    setExecutingRuleId(ruleId);
    setExecutionResult(null);
    try {
      const res = await api.post(`/rules/${ruleId}/run`);
      setExecutionResult({
        message: res.data.message,
        newFlags: res.data.newFlagsCount,
      });
      await fetchRules();
    } catch (err: any) {
      console.error('Error executing rule:', err);
      setExecutionResult({
        message: err.response?.data?.error || 'Failed to execute rule evaluation',
        newFlags: 0,
      });
    } finally {
      setExecutingRuleId(null);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/rules', {
        name: ruleName,
        ruleType,
        fieldName,
        operator,
        value,
        severity,
        isActive: true,
      });
      setShowNewRuleModal(false);
      setRuleName('');
      await fetchRules();
    } catch (err) {
      console.error('Error creating rule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    try {
      await api.delete(`/rules/${ruleToDelete.id}`);
      setRuleToDelete(null);
      await fetchRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Validation Rule Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Author, test, and schedule deterministic cross-field, range, and referential validation constraints
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewRuleModal(true)}
            id="new-rule-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Rule</span>
          </button>
        </div>
      </div>

      {/* Execution Feedback Banner */}
      {executionResult && (
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-4 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-teal-700 dark:text-teal-400 min-w-[20px]" />
            <p className="text-xs sm:text-sm text-teal-800 dark:text-teal-200 font-medium">
              {executionResult.message}
            </p>
          </div>
          {executionResult.newFlags > 0 && (
            <Link
              to="/app/flags"
              className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-teal-700 transition-colors shadow-xs"
            >
              <span>View In Flags Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Rules Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Rule Name</th>
                <th className="py-3.5 px-4">Rule Type</th>
                <th className="py-3.5 px-4">Target Field</th>
                <th className="py-3.5 px-4">Operator & Condition</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Active</th>
                <th className="py-3.5 px-4">Flags Generated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">Loading validation rules...</td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">No validation rules registered.</td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                      {rule.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] border border-slate-200 dark:border-slate-700">
                        {rule.ruleType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {rule.fieldName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {rule.operator} {rule.value}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        rule.severity === 'high'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                          : rule.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        id={`toggle-rule-${rule.id.slice(0, 4)}`}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          rule.isActive ? 'bg-teal-600 justify-end' : 'bg-slate-400 dark:bg-slate-600 justify-start'
                        }`}
                        title={rule.isActive ? 'Active (Click to disable)' : 'Disabled (Click to activate)'}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {rule._count?.flags || 0} flags
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleRunRule(rule.id)}
                        disabled={executingRuleId === rule.id}
                        id={`run-rule-btn-${rule.id.slice(0, 4)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold transition-all text-[11px] disabled:opacity-50"
                        title="Evaluate rule against survey records"
                      >
                        <Play className="w-3 h-3" />
                        <span>{executingRuleId === rule.id ? 'Evaluating...' : 'Run Rule'}</span>
                      </button>

                      <button
                        onClick={() => setRuleToDelete(rule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Rule Modal */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-base">Create Validation Constraint Rule</h3>
              </div>
              <button
                onClick={() => setShowNewRuleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Extreme HCE vs Income Disparity"
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Rule Category</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="cross_field">Cross-Field Consistency</option>
                    <option value="range">Range / Outlier Boundary</option>
                    <option value="existential">Existential / Completeness</option>
                    <option value="referential">Referential Linkage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Field</label>
                  <select
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  >
                    <option value="hceTot">hceTot (Household Consumption)</option>
                    <option value="incTot">incTot (Total Household Income)</option>
                    <option value="hhSize">hhSize (Household Size)</option>
                    <option value="responseCode">responseCode (Respondent Code)</option>
                    <option value="surDate">surDate (Survey Date)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Operator</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  >
                    <option value="ratio_gt_inc_3">ratio_gt (HCE / Income ratio)</option>
                    <option value=">">&gt; (Greater than)</option>
                    <option value="<">&lt; (Less than)</option>
                    <option value="<=">&lt;= (Less than or equal)</option>
                    <option value="==">== (Exact match)</option>
                    <option value="proxy_high_income">proxy_high_income (Code 4 + High Inc)</option>
                    <option value="single_huge_hce">single_huge_hce (1 Person + Huge Exp)</option>
                    <option value="not_null">not_null (Must not be empty)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Threshold / Formula Value</label>
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 3.0 or 250000"
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Anomaly Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                >
                  <option value="high">High Severity (Immediate Triage Alert)</option>
                  <option value="medium">Medium Severity (Flagged for Review)</option>
                  <option value="low">Low Severity (Diagnostic Advisory)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRuleModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="submit-rule-btn"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Deploy Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {ruleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <h3 className="font-bold text-base text-rose-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Rule Deletion</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Are you sure you want to permanently delete rule <strong>"{ruleToDelete.name}"</strong>?
            </p>
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
              <button
                onClick={() => setRuleToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRule}
                id="confirm-delete-rule-btn"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
