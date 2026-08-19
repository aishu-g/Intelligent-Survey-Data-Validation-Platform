import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  FileCheck2,
  AlertTriangle,
  Users,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Ingestion & Batches', path: '/app/ingestion', icon: Database },
    { label: 'Rule Studio', path: '/app/rules', icon: FileCheck2 },
    { label: 'Anomaly Flag Queue', path: '/app/flags', icon: AlertTriangle },
    { label: 'Enumerator Profiling', path: '/app/enumerators', icon: Users },
    { label: 'ML Model Registry', path: '/app/models', icon: BrainCircuit },
    { label: 'Reports & Export', path: '/app/reports', icon: FileSpreadsheet },
    { label: 'Security & Privacy', path: '/app/security', icon: Lock },
    { label: 'Platform Settings', path: '/app/settings', icon: Settings },
  ];


  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-slate-800 transition-all ${
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 min-w-[40px] rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-extrabold text-base tracking-wide text-white">ISDVP</span>
              <p className="text-[10px] text-teal-400 uppercase font-semibold tracking-wider">MoSPI / NSO Govt</p>
            </div>
          )}
        </div>

        {!collapsed ? (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-md border-2 border-slate-900 transition-transform hover:scale-110 z-40"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 min-w-[20px] transition-transform group-hover:scale-110" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>


      {/* User Status Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 min-w-[36px] rounded-xl bg-teal-600 flex items-center justify-center font-bold text-sm text-white shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Authorized Officer'}</p>
              <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                user?.role === 'admin'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : user?.role === 'hsd_official'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}>
                {user?.role === 'admin' ? 'Admin / DG' : user?.role === 'hsd_official' ? 'HSD Official' : 'Viewer'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

