import React from 'react';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'products' | 'categories' | 'orders';
  setCurrentTab: (tab: 'dashboard' | 'products' | 'categories' | 'orders') => void;
  showCategoryTab: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, showCategoryTab }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Catalog CRUD', icon: ShoppingBag },
    ...(showCategoryTab ? [{ id: 'categories', label: 'Categories', icon: FolderTree }] : []),
    { id: 'orders', label: 'Orders List', icon: ClipboardList },
  ] as const;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-cardbg-dark min-h-[calc(100vh-73px)] p-4 flex flex-col gap-1 transition-all duration-200">
      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">
        Management Tools
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id as any)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-accent dark:bg-accent text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};
