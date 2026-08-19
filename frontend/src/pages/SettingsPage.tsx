import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Sun,
  Moon,
  Users,
  CheckCircle,
  Save,
  ShieldCheck,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'users'>('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Admin Users Management
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleUpdatingId, setUserRoleUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    try {
      setUsersLoading(true);
      const res = await api.get('/users');
      setUsersList(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && user?.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    try {
      const res = await api.patch('/auth/profile', { name });
      updateUser({ name: res.data.user.name });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUserRoleUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update user role:', err);
    } finally {
      setUserRoleUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Platform Settings & User Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure personal preferences, theme aesthetics, and administrative role assignments
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          id="tab-profile-btn"
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Officer Info</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          id="tab-appearance-btn"
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'appearance'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Theme & Appearance</span>
        </button>

        {/* Role-gated Admin Tab */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('users')}
            id="tab-users-btn"
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-red-600 text-red-700 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin: User Roles Management</span>
          </button>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Profile details updated successfully.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Official Name</label>
              <input
                type="text"
                required
                id="profile-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Official Email</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full py-2 px-3 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned Platform Role</label>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                  {user?.role.replace('_', ' ')}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                  user?.role === 'admin'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                    : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                id="save-profile-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Interface Color Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose your preferred visual theme for dashboards and tables.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              id="set-theme-light-btn"
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-teal-600 ring-2 ring-teal-600/30 bg-teal-50/50'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Sun className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="font-bold text-xs text-slate-800 block">Light Mode (Anti-Glare)</span>
                <span className="text-[10px] text-slate-500">Corporate slate-50 background with pure white cards</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              id="set-theme-dark-btn"
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-teal-600 ring-2 ring-teal-600/30 bg-slate-900'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-teal-400">
                <Moon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="font-bold text-xs text-slate-100 block">Dark Slate Theme</span>
                <span className="text-[10px] text-slate-400">Deep Slate-900 palette with teal accents</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Admin Users Management Tab (Admin Only) */}
      {activeTab === 'users' && user?.role === 'admin' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-700 dark:text-red-400" />
              <span>
                <strong>Administrator Access:</strong> Modify user roles and triage privileges across the platform.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold">{usersList.length} Accounts Registered</span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">User / Officer Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Current Role</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Assign New Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">Loading user accounts...</td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                          {u.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            u.role === 'admin'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                              : u.role === 'hsd_official'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={u.role}
                            disabled={userRoleUpdatingId === u.id || u.id === user.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            id={`role-select-${u.id.slice(0, 4)}`}
                            className="py-1 px-2.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-50"
                          >
                            <option value="admin">admin (Full DG)</option>
                            <option value="hsd_official">hsd_official (Validation)</option>
                            <option value="viewer">viewer (Read-only)</option>
                          </select>
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
    </div>
  );
};
