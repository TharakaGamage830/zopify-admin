import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';

interface NavbarProps {
  user: any;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, theme, setTheme, onLogout, onOpenProfile }) => {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-cardbg-dark transition-all duration-200">
      <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-accent dark:text-accent-light">
        <img 
          src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'} 
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
          <div className="flex items-center gap-4 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-3 text-left hover:opacity-85 active:scale-[0.98] transition cursor-pointer select-none group focus:outline-none"
              title="View Profile / Settings"
            >
              <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 text-accent font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span>
                    {user.fullName
                      ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'U'}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-850 dark:text-slate-250 group-hover:text-accent transition duration-150 leading-tight">{user.fullName}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role} Panel</div>
              </div>
            </button>

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

