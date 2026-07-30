import React, { useState } from 'react';
import type { User } from '../services/userServiceAPI';
import { Search, UserPlus, Edit2, Trash2, ShieldAlert, ShieldCheck, Mail, Calendar } from 'lucide-react';

interface AdminsPageProps {
  admins: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleActive: (user: User) => void;
  onOpenCreateModal: () => void;
}

export const AdminsPage: React.FC<AdminsPageProps> = ({
  admins,
  onEdit,
  onDelete,
  onToggleActive,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredAdmins = admins.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="text-left animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Administrators & Staff</h1>
          <p className="text-xs text-slate-400 mt-1">Manage system administrators, staff personnel and control access permissions.</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="bg-accent hover:bg-accent-hover text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm self-start sm:self-auto"
        >
          <UserPlus size={16} />
          <span>Add Admin / Staff</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Toggle Selector */}
        <div className="flex flex-wrap bg-slate-55 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800/80 gap-1">
          {([
            { id: 'all', label: 'All Roles' },
            { id: 'super_admin', label: 'Super Admin' },
            { id: 'admin', label: 'Admin' },
            { id: 'catalog_manager', label: 'Catalog' },
            { id: 'order_manager', label: 'Orders' },
            { id: 'support_agent', label: 'Support' },
            { id: 'staff', label: 'Staff' },
          ]).map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                roleFilter === r.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admins Table Card */}
      <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">User Profile</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">System Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-cardbg-dark">
              {filteredAdmins.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                        a.role === 'super_admin' || a.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-500' 
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {a.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.fullName}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={11} />
                          <span>{a.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <div className="inline-flex items-center gap-1.5 text-accent dark:text-accent-hover">
                      {a.role === 'super_admin' || a.role === 'admin' ? (
                        <ShieldAlert size={14} className="text-rose-500" />
                      ) : (
                        <ShieldCheck size={14} className="text-indigo-500" />
                      )}
                      <span className="capitalize text-xs font-bold tracking-wider">{a.role.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                      <span>{formatDate(a.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActive(a)}
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition ${
                        a.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      }`}
                      title="Click to toggle access permissions"
                    >
                      {a.isActive ? 'Active' : 'Revoked'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(a)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Edit Admin"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        title="Delete Admin"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-450 dark:text-slate-500">
                    No administrator accounts match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
