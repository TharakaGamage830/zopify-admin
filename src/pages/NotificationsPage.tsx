import React, { useState, useEffect } from 'react';
import {
  Send,
  Bell,
  Users,
  CheckCircle,
  Trash2,
  History,
} from 'lucide-react';
import type { BroadcastNotification, TargetAudience } from '../types';

export const NotificationsPage: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [noticeType, setNoticeType] = useState<'promo' | 'system' | 'order' | 'security'>('promo');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Initial broadcast history samples
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zopify_admin_broadcasts');
        if (saved) {
          setBroadcasts(JSON.parse(saved));
        } else {
          const sampleBroadcasts: BroadcastNotification[] = [
            {
              id: 'bc_1',
              title: '⚡ Weekend Flash Sale 40% OFF All Accessories',
              message: 'Use code FLASH40 at checkout to unlock exclusive discount prices across all item categories!',
              type: 'promo',
              targetAudience: 'all',
              targetAudienceLabel: 'All Users (1,420 users)',
              scheduledAt: null,
              status: 'sent',
              recipientCount: 1420,
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
              id: 'bc_2',
              title: '👑 VIP Premium Perk: Double Points Weekend',
              message: 'Exclusive benefit for VIP subscribers! Earn double loyalty points on every purchase made this weekend.',
              type: 'promo',
              targetAudience: 'vip',
              targetAudienceLabel: 'VIP Subscribers (240 users)',
              scheduledAt: null,
              status: 'sent',
              recipientCount: 240,
              createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
            {
              id: 'bc_3',
              title: '🔒 Scheduled Security & System Maintenance',
              message: 'Zopify platform will undergo scheduled maintenance tonight at 02:00 UTC. System services will remain uninterrupted.',
              type: 'system',
              targetAudience: 'all',
              targetAudienceLabel: 'All Users',
              scheduledAt: new Date(Date.now() + 86400000).toISOString(),
              status: 'scheduled',
              recipientCount: 1420,
              createdAt: new Date().toISOString(),
            },
          ];
          setBroadcasts(sampleBroadcasts);
          localStorage.setItem('zopify_admin_broadcasts', JSON.stringify(sampleBroadcasts));
        }
      } catch (e) {}
    }
  }, []);

  const saveBroadcasts = (newLogs: BroadcastNotification[]) => {
    setBroadcasts(newLogs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zopify_admin_broadcasts', JSON.stringify(newLogs));
    }
  };

  const getTargetAudienceLabel = (audience: TargetAudience) => {
    switch (audience) {
      case 'all':
        return 'All Registered Users';
      case 'active':
        return 'Active Shoppers (Last 30 Days)';
      case 'vip':
        return 'VIP / Premium Subscribers';
      case 'inactive':
        return 'Inactive Accounts (> 60 Days)';
      default:
        return 'All Users';
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);

    setTimeout(() => {
      const isScheduled = !!scheduledAt;
      const newBroadcast: BroadcastNotification = {
        id: `bc_${Date.now()}`,
        title,
        message,
        type: noticeType,
        targetAudience,
        targetAudienceLabel: getTargetAudienceLabel(targetAudience),
        scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : null,
        status: isScheduled ? 'scheduled' : 'sent',
        recipientCount: targetAudience === 'vip' ? 240 : targetAudience === 'inactive' ? 310 : 1420,
        createdAt: new Date().toISOString(),
      };

      const updated = [newBroadcast, ...broadcasts];
      saveBroadcasts(updated);

      setSending(false);
      setSuccessMsg(isScheduled ? 'Broadcast notification scheduled successfully!' : 'Broadcast dispatched successfully to all recipients!');
      
      // Reset form
      setTitle('');
      setMessage('');
      setScheduledAt('');

      setTimeout(() => setSuccessMsg(''), 4000);
    }, 600);
  };

  const handleDeleteBroadcast = (id: string) => {
    if (confirm('Are you sure you want to delete this broadcast log?')) {
      const updated = broadcasts.filter((b) => b.id !== id);
      saveBroadcasts(updated);
    }
  };

  const applyTemplate = (templateType: 'flash_sale' | 'system_alert' | 'vip_reward') => {
    if (templateType === 'flash_sale') {
      setTitle('🔥 Exclusive 24-Hour Flash Sale Alert!');
      setMessage('Enjoy up to 50% discount on selected products today! Shop before stocks run out.');
      setNoticeType('promo');
      setTargetAudience('all');
    } else if (templateType === 'system_alert') {
      setTitle('⚙️ System Upgrade Notice');
      setMessage('We have updated the Zopify shopping experience with faster checkout and improved order tracking.');
      setNoticeType('system');
      setTargetAudience('all');
    } else if (templateType === 'vip_reward') {
      setTitle('💎 VIP Reward Voucher Inside');
      setMessage('As a valued VIP member, here is your $15 discount coupon for your next purchase!');
      setNoticeType('promo');
      setTargetAudience('vip');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Broadcast Center</h1>
              <p className="text-xs text-slate-400">
                Dispatch platform notifications, promotional announcements & maintenance alerts to targeted users
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium">
            Active Audience Reach: <strong className="text-emerald-400">1,420 Users</strong>
          </span>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={18} className="text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create & Dispatch Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send size={18} className="text-indigo-400" />
              Compose Broadcast Message
            </h2>

            {/* Quick Templates */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Templates:</span>
              <button
                type="button"
                onClick={() => applyTemplate('flash_sale')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded-lg transition"
              >
                Flash Sale
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('vip_reward')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded-lg transition"
              >
                VIP Reward
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('system_alert')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded-lg transition"
              >
                System Notice
              </button>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Broadcast Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ⚡ Exclusive Weekend Flash Sale is Live!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Type & Target Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notification Type
                </label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="promo">🎉 Promotional / Offer</option>
                  <option value="system">⚙️ System & Platform Alert</option>
                  <option value="order">📦 Order Update Broadcast</option>
                  <option value="security">🔒 Security Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Audience Filter
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">🌐 All Registered Users (1,420)</option>
                  <option value="active">🛍️ Active Shoppers Last 30 Days (890)</option>
                  <option value="vip">👑 VIP & Premium Subscribers (240)</option>
                  <option value="inactive">💤 Inactive Users &gt; 60 Days (310)</option>
                </select>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message Body <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter detailed message text to be delivered to user notification drawers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Schedule Option */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Schedule Broadcast (Optional)
                </label>
                <p className="text-[11px] text-slate-500">Leave blank to dispatch notification immediately.</p>
              </div>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Send size={15} />
                {sending ? 'Dispatching...' : scheduledAt ? 'Schedule Broadcast' : 'Send Broadcast Now'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Target Audience Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users size={16} className="text-indigo-400" />
              Audience Segment Breakdown
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-xs text-slate-300 font-medium">All Platform Users</span>
                </div>
                <span className="text-xs font-bold text-white">1,420</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-300 font-medium">Active Shoppers (30d)</span>
                </div>
                <span className="text-xs font-bold text-white">890</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-300 font-medium">VIP Members</span>
                </div>
                <span className="text-xs font-bold text-white">240</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-300 font-medium">Inactive Users (&gt;60d)</span>
                </div>
                <span className="text-xs font-bold text-white">310</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History size={18} className="text-indigo-400" />
            Broadcast Dispatch Log & History ({broadcasts.length})
          </h3>
        </div>

        {broadcasts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No broadcast history recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Title & Message</th>
                  <th className="px-5 py-3">Target Audience</th>
                  <th className="px-5 py-3">Recipients</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {broadcasts.map((bc) => (
                  <tr key={bc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          bc.type === 'promo'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : bc.type === 'system'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {bc.type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white max-w-sm truncate">{bc.title}</div>
                      <div className="text-[11px] text-slate-400 max-w-sm truncate">{bc.message}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-300 font-medium">
                      {bc.targetAudienceLabel}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-200">
                      {bc.recipientCount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          bc.status === 'sent'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {bc.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(bc.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteBroadcast(bc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete log entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
