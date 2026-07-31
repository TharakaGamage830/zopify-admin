import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, User, Settings, Camera, Mail, Calendar, Shield, Eye, EyeOff } from 'lucide-react';
import { userServiceAPI } from '../../services/userServiceAPI';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated: (updatedUser: any) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [uploading, setUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setError('');
      setSuccess('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await userServiceAPI.uploadAvatar(file);
      setForm((prev) => ({ ...prev, avatarUrl: res.url }));
      setSuccess('Profile image uploaded! Click Save to apply.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword) {
      if (form.newPassword !== form.confirmNewPassword) {
        setError('New passwords do not match');
        return;
      }
      if (form.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }
      if (!form.currentPassword) {
        setError('Please enter your current password to save credentials change');
        return;
      }
    }

    try {
      const submitData: any = {
        fullName: form.fullName,
        email: form.email,
        avatarUrl: form.avatarUrl,
      };

      if (form.newPassword) {
        submitData.currentPassword = form.currentPassword;
        submitData.newPassword = form.newPassword;
      }

      const updated = await userServiceAPI.updateProfile(submitData);
      onProfileUpdated(updated);
      setSuccess('Profile updated successfully!');
      
      // Reset password fields
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile details');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const avatar = form.avatarUrl || user?.avatarUrl;
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-left relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <User size={18} className="text-accent" />
            <span>Profile Panel</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 px-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            <User size={15} />
            <span>View Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            <Settings size={15} />
            <span>Edit Settings</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-lg">
              {success}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="flex flex-col items-center text-center py-4">
              {/* Profile Avatar */}
              <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent text-accent flex items-center justify-center font-bold text-2xl mb-4 overflow-hidden relative shadow-sm">
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{user?.fullName}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium capitalize mt-0.5">{user?.role} Access</p>

              {/* Profile Details List */}
              <div className="w-full mt-6 bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-2">
                    <Mail size={14} />
                    <span>Email Address</span>
                  </span>
                  <span className="text-slate-700 dark:text-slate-350 font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-2">
                    <Shield size={14} />
                    <span>System Role</span>
                  </span>
                  <span className="text-slate-700 dark:text-slate-350 font-semibold capitalize">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Date Joined</span>
                  </span>
                  <span className="text-slate-700 dark:text-slate-350 font-medium">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent text-accent flex items-center justify-center font-bold text-lg overflow-hidden relative">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <span>{initials}</span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
                    <Camera size={14} />
                    <span>Change Profile Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">Accepts WebP, JPG or PNG. Automatic square format.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Change Password (Optional)</span>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Required to change password"
                      className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                      value={form.currentPassword}
                      onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650"
                    >
                      {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650"
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                      value={form.confirmNewPassword}
                      onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  disabled={uploading}
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition duration-150 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
