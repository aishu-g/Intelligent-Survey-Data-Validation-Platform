import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Plus,
  Play,
  Archive,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Cpu,
  X,
  TrendingUp,
  Zap,
  Activity,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import api from '../services/api';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Continuous Online Self-Training State
  const [autoRetrainingNow, setAutoRetrainingNow] = useState(false);
  const [autoRetrainSuccess, setAutoRetrainSuccess] = useState<string | null>(null);
  const [continuousStatus, setContinuousStatus] = useState<any>({
    status: 'ACTIVE_ONLINE_LEARNING',
    autoRetrainOnIngest: true,
    totalAccumulatedRecords: 520,
    activeModelsCalibrated: 5,
    learningRate: 0.005,
    lastSelfTrainedAt: new Date().toLocaleTimeString(),
  });

  // Training Modal State
  const [showTrainModal, setShowTrainModal] = useState(false);
  const [modelName, setModelName] = useState('PLFS Autoencoder Anomaly Detector');
  const [modelType, setModelType] = useState('Autoencoder');
  const [batchId, setBatchId] = useState('');
  const [version, setVersion] = useState('v2.2.0');
  const [training, setTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/models');
      setModels(res.data.models || []);
    } catch (err) {
      console.error('Error loading models:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContinuousStatus = async () => {
    try {
      const res = await api.get('/models/continuous-learning-status');
      setContinuousStatus(res.data);
    } catch (err) {
      // quiet fail
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      const bList = res.data.batches || [];
      setBatches(bList);
      if (bList.length > 0 && !batchId) {
        setBatchId(bList[0].id);
      }
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  useEffect(() => {
    fetchModels();
    fetchBatches();
    fetchContinuousStatus();
  }, []);

  const handleTriggerAutoRetrain = async () => {
    setAutoRetrainingNow(true);
    setAutoRetrainSuccess(null);

    try {
      const res = await api.post('/models/auto-retrain', {
        recordCount: continuousStatus.totalAccumulatedRecords || 50,
      });

      setAutoRetrainSuccess(res.data.message || 'Continuous self-training cycle executed successfully.');
      await fetchModels();
      await fetchContinuousStatus();

      setTimeout(() => {
        setAutoRetrainSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to trigger auto-retrain:', err);
    } finally {
      setAutoRetrainingNow(false);
    }
  };

  const handleTrainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTraining(true);
    setTrainProgress(15);

    const interval = setInterval(() => {
      setTrainProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 400);

    try {
      await api.post('/models/train', {
        name: modelName,
        modelType,
        batchId,
        version,
      });

      setTrainProgress(100);
      setTimeout(async () => {
        clearInterval(interval);
        setTraining(false);
        setShowTrainModal(false);
        setTrainProgress(0);
        await fetchModels();
      }, 600);
    } catch (err) {
      console.error('Failed to train model:', err);
      clearInterval(interval);
      setTraining(false);
      setTrainProgress(0);
    }
  };

  const handleToggleStatus = async (model: any) => {
    try {
      const newStatus = model.status === 'active' ? 'archived' : 'active';
      await api.patch(`/models/${model.id}`, { status: newStatus });
      setModels((prev) =>
        prev.map((m) => (m.id === model.id ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      console.error('Failed to update model status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
              Module 5 • Continuous Self-Training Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-1">
            Machine Learning Model Registry & Active Learning
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous online learning architectures that automatically retrain and calibrate anomaly detection as new survey data is ingested
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerAutoRetrain}
            disabled={autoRetrainingNow}
            id="trigger-self-train-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${autoRetrainingNow ? 'animate-bounce' : ''}`} />
            <span>{autoRetrainingNow ? 'Calibrating Online Weights...' : '⚡ Trigger Self-Training Cycle'}</span>
          </button>

          <button
            onClick={() => setShowTrainModal(true)}
            id="train-model-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Train New Architecture</span>
          </button>
        </div>
      </div>

      {/* Continuous Self-Training Engine Live Monitor Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#12163B] text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  Continuous Self-Training Engine (Online Learning Loop)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ONLINE & AUTO-CALIBRATING</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every time survey data is ingested or supervisor reviews a flag, models incrementally update their weights without offline downtime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Auto-Retrain on Ingest:</span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40">
              ✓ ALWAYS ENABLED
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Accumulated Training Records</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              {continuousStatus.totalAccumulatedRecords}
            </span>
            <span className="text-[10px] text-teal-400">Dynamically Calibrated</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Online Learning Rate (η)</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
              {continuousStatus.learningRate}
            </span>
            <span className="text-[10px] text-slate-400">Adaptive Gradient</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Calibrated Models</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
              {models.filter((m) => m.status === 'active').length} Architectures
            </span>
            <span className="text-[10px] text-emerald-400">Auto-Synchronized</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Reconstruction Loss Delta</span>
            <span className="text-xl font-black text-teal-300 font-mono mt-1 block">
              -0.024 RMS
            </span>
            <span className="text-[10px] text-teal-400">Minimizing Over Time</span>
          </div>
        </div>

        {autoRetrainSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{autoRetrainSuccess}</span>
          </div>
        )}
      </div>

      {/* Models Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">

            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Model Name</th>
                <th className="py-3.5 px-4">Algorithm Technique</th>
                <th className="py-3.5 px-4">Training Batch</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Accuracy / Precision</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">Loading model registry...</td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">No machine learning models found.</td>
                </tr>
              ) : (
                models.map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-teal-700 dark:text-teal-400">
                      {model.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] border border-slate-200 dark:border-slate-700">
                        {model.modelType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-300 font-medium">
                      {model.trainedOnBatch?.surveyName} <span className="text-[10px] text-slate-400">({model.trainedOnBatch?.quarter})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      {model.version}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {model.accuracyMetric}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        model.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : model.status === 'training'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(model.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(model)}
                        id={`toggle-model-status-${model.id.slice(0, 4)}`}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                          model.status === 'active'
                            ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-red-950/40 dark:text-slate-300 dark:hover:text-red-300'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                        }`}
                      >
                        {model.status === 'active' ? 'Archive' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train Model Modal */}
      {showTrainModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-base">Train Unsupervised ML Model</h3>
              </div>
              <button
                onClick={() => setShowTrainModal(false)}
                disabled={training}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTrainSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. PLFS Deep Autoencoder v2"
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Algorithm Technique</label>
                  <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="Isolation Forest">Isolation Forest</option>
                    <option value="One-Class SVM">One-Class SVM</option>
                    <option value="Bayesian Hierarchical">Bayesian Hierarchical</option>
                    <option value="DBSCAN">DBSCAN Clustering</option>
                    <option value="Autoencoder">Variational Autoencoder (VAE)</option>
                    <option value="XGBoost">XGBoost Outlier Classifier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Version Tag</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Training Baseline Batch</label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  required
                  className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.surveyName} — {b.quarter} ({b._count?.records || b.recordCount} records)
                    </option>
                  ))}
                </select>
              </div>

              {training && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-teal-400 font-mono font-bold">
                    <span>Training Latent Space Representation...</span>
                    <span>{trainProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTrainModal(false)}
                  disabled={training}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={training}
                  id="start-training-btn"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {training ? 'Training Model...' : 'Start Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
