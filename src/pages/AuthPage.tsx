import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dominant-dark transition-all duration-200 p-4">
      <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-md p-8 text-left animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-accent/10 text-accent rounded-full mb-3">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Zopify Control Center</h2>
          <p className="text-xs text-slate-400 mt-1">Authorized Admin / Staff credentials required.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Password</label>
            <input
              type="password"
              required
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary mt-3 py-2.5"
          >
            {loading ? 'Authenticating...' : 'Enter Console'}
          </button>
        </form>
      </div>
    </div>
  );
};
