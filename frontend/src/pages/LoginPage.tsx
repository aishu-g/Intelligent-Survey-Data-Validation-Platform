import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: demoEmail, password: demoPass });
      login(res.data.token, res.data.user);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 sm:px-6 lg:px-8 py-12 text-white relative overflow-hidden">
      {/* Subtle Atmospheric Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group mb-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-teal-950/50">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sign In to ISDVP
          </h1>
          <p className="mt-1.5 text-xs text-slate-300 font-semibold uppercase tracking-wider">
            MoSPI / NSO Survey Validation Gateway
          </p>
        </div>

        {/* Demo Login Fast Action Cards */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>One-Click Demo Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => handleDemoLogin('admin@mospi.gov.in', 'Admin@123')}
              className="p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800 text-left transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-200">Admin / DG</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 font-medium">Full System Access</p>
            </button>

            <button
              type="button"
              id="demo-hsd-btn"
              onClick={() => handleDemoLogin('hsd.official@mospi.gov.in', 'Hsd@123')}
              className="p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-700 text-left transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-200">HSD Official</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 font-medium">Triage & Validation</p>
            </button>
          </div>
        </div>

        {/* Login Form Container */}
        <form
          className="space-y-5 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl"
          onSubmit={handleLogin}
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 min-w-[16px] text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                id="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mospi.gov.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                id="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="login-submit-btn"
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-300">
              Need a testing account?{' '}
              <Link
                to="/signup"
                className="text-sky-400 hover:text-sky-300 hover:underline font-semibold transition-colors"
              >
                Register as Viewer
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

