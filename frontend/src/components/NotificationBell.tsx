import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [highFlags, setHighFlags] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchHighPriorityAlerts = async () => {
    try {
      const res = await api.get('/flags?severity=high&status=open&limit=5');
      setHighFlags(res.data.flags || []);
      setCount(res.data.pagination?.total || 0);
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchHighPriorityAlerts();
    const interval = setInterval(fetchHighPriorityAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        id="notification-bell-btn"
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        title="High Severity Anomaly Alerts"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 animate-pulse">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#151A38] border border-slate-700 shadow-2xl z-50 overflow-hidden text-white animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 border-b border-slate-700 flex items-center justify-between bg-[#12163B]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-semibold">Priority Triage Alerts</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
              {count} Open High
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
            {highFlags.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto text-teal-400 mb-2 opacity-70" />
                <p>No open high-severity flags.</p>
              </div>
            ) : (
              highFlags.map((flag) => (
                <Link
                  key={flag.id}
                  to="/app/flags"
                  onClick={() => setOpen(false)}
                  className="block p-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-rose-300 group-hover:text-rose-200 truncate">
                      {flag.record?.fileId || 'Survey Record'}
                    </p>
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-1.5 py-0.2 rounded">
                      {Math.round(flag.anomalyScore)}% Anomaly
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {flag.explanationText}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span>{flag.record?.batch?.surveyName} · {flag.record?.batch?.quarter}</span>
                    <span className="text-teal-400 group-hover:underline flex items-center gap-1">
                      Triage <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 bg-[#0D102D] border-t border-slate-800 text-center">
            <Link
              to="/app/flags"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center justify-center gap-1.5"
            >
              <span>View All Flags Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
