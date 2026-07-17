import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';

interface NavbarProps {
  user: any;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, theme, setTheme, onLogout }) => {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-cardbg-dark transition-all duration-200">
      <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-accent dark:text-accent-light">
        <img 
          src="/logo.png" 
          className="w-8 h-8 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700" 
          alt="Zopify" 
        />
        <span className="bg-gradient-to-r from-accent to-purple-650 bg-clip-text text-transparent dark:from-accent-light dark:to-purple-400">
          Zopify Admin
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.fullName}</div>
              <div className="text-xs text-slate-400 capitalize">{user.role}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-full border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
