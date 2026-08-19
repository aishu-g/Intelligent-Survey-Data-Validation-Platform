import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-white/10 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo and Emblem */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#12163B] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-xl bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
                ISDVP
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                MoSPI · NSO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent Survey Data Validation Platform
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#problem" className="hover:text-teal-400 transition-colors">Problem</a>
          <a href="#objectives" className="hover:text-teal-400 transition-colors">Objectives</a>
          <a href="#architecture" className="hover:text-teal-400 transition-colors">Architecture</a>
          <a href="#flow" className="hover:text-teal-400 transition-colors">System Flow</a>
          <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
          <a href="#techstack" className="hover:text-teal-400 transition-colors">Tech Stack</a>
          <a href="#impact" className="hover:text-teal-400 transition-colors">Impact</a>
          <a href="#roadmap" className="hover:text-teal-400 transition-colors">Roadmap</a>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          <Link
            to={user ? "/app/dashboard" : "/login"}
            id="nav-launch-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <span>{user ? "Open Platform" : "Launch Platform"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
