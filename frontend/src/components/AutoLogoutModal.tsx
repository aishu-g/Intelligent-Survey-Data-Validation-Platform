import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, LogOut, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Idle timeout configuration (15 minutes idle, 60 seconds warning)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_COUNTDOWN_SECONDS = 60;

export const AutoLogoutModal: React.FC = () => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_COUNTDOWN_SECONDS);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);


  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(WARNING_COUNTDOWN_SECONDS);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
  }, [showWarning]);

  // Listen to user interaction events across the entire window
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleUserActivity = () => {
      // Only update if warning modal is not active to prevent dismissing during countdown without clicking
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check for idle threshold
    timerRef.current = setInterval(() => {
      if (!user) return;
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= INACTIVITY_TIMEOUT_MS && !showWarning) {
        setShowWarning(true);
        setSecondsRemaining(WARNING_COUNTDOWN_SECONDS);
      }
    }, 5000);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, showWarning]);

  // Countdown timer when warning modal is open
  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    }
  }, [showWarning, logout]);

  if (!user || !showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-amber-300 dark:border-amber-700/50 shadow-2xl p-6 text-center space-y-5">
        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Security Session Timeout
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For data security compliance, your session will automatically terminate due to inactivity.
          </p>
        </div>

        {/* Countdown Badge */}
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Auto-logging out in:</span>
          <span className="text-lg font-mono font-extrabold text-red-600 dark:text-red-400">
            {secondsRemaining}s
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={logout}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Now</span>
          </button>

          <button
            type="button"
            onClick={resetActivity}
            className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Keep Session Alive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
