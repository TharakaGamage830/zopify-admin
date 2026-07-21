import React, { useState } from 'react';
import type { User } from '../services/userServiceAPI';
import { Search, UserPlus, Edit2, Trash2, Calendar, Mail } from 'lucide-react';

interface CustomersPageProps {
  customers: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleActive: (user: User) => void;
  onOpenCreateModal: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  onEdit,
  onDelete,
  onToggleActive,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Customers Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage storefront customer accounts, activation status and registration details.</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="bg-accent hover:bg-accent-hover text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm self-start sm:self-auto"
        >
          <UserPlus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mb-5 flex items-center bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-cardbg-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Info</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-cardbg-dark">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                        {c.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.fullName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">ID: {c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-450">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400 dark:text-slate-500" />
                      <span>{c.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActive(c)}
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition ${
                        c.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      }`}
                      title="Click to toggle account activation"
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Edit Customer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        title="Delete Customer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-450 dark:text-slate-500">
                    No customers found matching the search criteria.
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
