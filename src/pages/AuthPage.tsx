import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sun,
  Moon,
  Zap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Server,
  Activity,
  KeyRound,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const adminContext = useAdmin();
  const theme = adminContext?.theme || 'light';
  const setTheme = adminContext?.setTheme;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const handlePresetFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Access denied or invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual-Panel Container */}
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        
        {/* Left Side: Brand Showcase & Security Highlights */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-12 flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl shadow-lg shadow-violet-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-violet-300">
                ZOPIFY
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Control Console
              </span>
            </div>
          </div>

          {/* Middle Value Proposition */}
          <div className="relative z-10 my-auto max-w-lg space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Next-Gen Commerce Administration</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Empowering high-scale retail operations with precision.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Access unified product catalog management, real-time inventory adjustments, multi-channel order orchestration, and strict RBAC governance.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
                <Zap className="w-5 h-5 text-violet-400 mb-2" />
                <h2 className="text-sm font-semibold text-slate-200">Real-Time Processing</h2>
                <p className="text-xs text-slate-400 mt-1">Instant updates for orders, inventory GRN, and shipping status.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
                <Server className="w-5 h-5 text-indigo-400 mb-2" />
                <h2 className="text-sm font-semibold text-slate-200">Role-Based Access</h2>
                <p className="text-xs text-slate-400 mt-1">Granular permissions for Admins, Catalog, Support, and Audit.</p>
              </div>
            </div>
          </div>

          {/* Bottom Live System Health Badge */}
          <div className="relative z-10 flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-medium text-slate-300">All Systems Operational</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>99.99% Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Admin Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 bg-slate-950 dark:bg-dominant-dark transition-colors duration-200">
          
          {/* Top Bar Navigation & Controls */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold tracking-tight text-lg text-white">ZOPIFY</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
              </button>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                v2.4.0
              </span>
            </div>
          </div>

          {/* Center Form Container */}
          <div className="w-full max-w-md mx-auto my-auto space-y-6">
            
            {/* Header */}
            <div className="space-y-2 text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Sign in to Console</span>
                <KeyRound className="w-5 h-5 text-violet-400 inline-block" />
              </h2>
              <p className="text-xs text-slate-400">
                Enter your authorized staff or administrator credentials to log in.
              </p>
            </div>

            {/* Quick Presets for Dev / Testing */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Quick Fill Preset Credentials:</span>
                <span className="text-violet-400 font-mono">Dev Mode</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetFill('admin@zopify.com', 'password123')}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-violet-900/40 text-slate-300 hover:text-violet-300 border border-slate-700 hover:border-violet-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetFill('catalog@zopify.com', 'password123')}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-violet-900/40 text-slate-300 hover:text-violet-300 border border-slate-700 hover:border-violet-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-violet-400" />
                  Catalog Manager
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetFill('support@zopify.com', 'password123')}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-violet-900/40 text-slate-300 hover:text-violet-300 border border-slate-700 hover:border-violet-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  Support Agent
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-200">Authentication Failure</p>
                  <p className="mt-0.5 text-red-300/90">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@zopify.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      if (adminContext?.showToast) {
                        adminContext.showToast('Please contact your System Administrator to reset staff credentials.', 'info');
                      }
                    }}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] transition-all shadow-lg shadow-violet-600/25 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Console...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Console</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Security Badge */}
          <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-slate-500 space-y-1">
            <p>Protected by Zopify Shield Security System • TLS 1.3 Encrypted</p>
            <p className="text-[11px] text-slate-600">Unauthorized access is strictly prohibited and logged for security audits.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
