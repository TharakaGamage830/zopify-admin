import React from 'react';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, Truck, RefreshCcw, Users, UserCheck } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'products' | 'categories' | 'orders' | 'grn' | 'prn' | 'customers' | 'admins';
  setCurrentTab: (tab: 'dashboard' | 'products' | 'categories' | 'orders' | 'grn' | 'prn' | 'customers' | 'admins') => void;
  showCategoryTab: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, showCategoryTab }) => {
  const mainItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Catalog CRUD', icon: ShoppingBag },
    ...(showCategoryTab ? [{ id: 'categories', label: 'Categories', icon: FolderTree }] : []),
    { id: 'orders', label: 'Orders List', icon: ClipboardList },
    { id: 'grn', label: 'Goods Received (GRN)', icon: Truck },
    { id: 'prn', label: 'Product Returns (PRN)', icon: RefreshCcw },
  ] as const;

  const userItems = [
    { id: 'customers', label: 'Manage Customers', icon: Users },
    { id: 'admins', label: 'Manage Admins', icon: UserCheck },
  ] as const;

  const renderItem = (item: { id: string; label: string; icon: React.ComponentType<any> }) => {
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
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-cardbg-dark h-full p-4 flex flex-col gap-1 transition-all duration-200 flex-shrink-0">
      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">
        Management Tools
      </div>
      {mainItems.map(renderItem)}

      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 mt-5">
        User Management
      </div>
      {userItems.map(renderItem)}
    </aside>
  );
};

