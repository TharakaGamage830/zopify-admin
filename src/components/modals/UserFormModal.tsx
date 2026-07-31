import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import type { User, UserRole } from '../../services/userServiceAPI';
import { useAdmin } from '../../context/AdminContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  user: User | null;
  mode: 'customer' | 'admin'; // 'customer' manages customers, 'admin' manages admins/staff
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
}) => {
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'customer' as UserRole,
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        fullName: user.fullName,
        password: '', // blank by default on edit
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setForm({
        email: '',
        fullName: '',
        password: '',
        role: mode === 'admin' ? 'admin' : 'customer',
        isActive: true,
      });
    }
    setShowPassword(false);
  }, [user, isOpen, mode]);

  const { showToast } = useAdmin();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      email: form.email,
      fullName: form.fullName,
      role: form.role,
      isActive: form.isActive,
    };

    if (form.password) {
      if (form.password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'warning');
        return;
      }
      submitData.password = form.password;
    } else if (!user) {
      showToast('Password is required for new user accounts.', 'warning');
      return;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-md overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {user ? `Edit ${mode === 'admin' ? 'Admin / Staff' : 'Customer'}` : `Create New ${mode === 'admin' ? 'Admin / Staff' : 'Customer'}`}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
              {user ? 'New Password (Optional)' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required={!user}
                placeholder={user ? 'Leave blank to keep current' : 'At least 6 characters'}
                className="w-full px-3.5 py-2 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'admin' ? (
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                System Role
              </label>
              <select
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Administrator</option>
                <option value="catalog_manager">Catalog Manager</option>
                <option value="order_manager">Order Manager</option>
                <option value="support_agent">Support Agent</option>
                <option value="staff">Staff Member</option>
              </select>
            </div>
          ) : null}

          {user && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isActive"
                className="w-4 h-4 rounded text-accent focus:ring-accent border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label
                htmlFor="isActive"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                Account Active
              </label>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex justify-end gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition duration-150"
            >
              {user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
