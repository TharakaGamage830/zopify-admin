import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  Truck,
  RefreshCcw,
  Users,
  UserCheck,
  Ticket,
  Tag,
  Package as PackageIcon,
  MapPin,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Shield,
  Bell,
} from 'lucide-react';

interface SidebarProps {
  showCategoryTab: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ showCategoryTab }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const mainItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', path: '/products', label: 'Catalog CRUD', icon: ShoppingBag },
    ...(showCategoryTab ? [{ id: 'categories', path: '/categories', label: 'Categories', icon: FolderTree }] : []),
    { id: 'orders', path: '/orders', label: 'Orders List', icon: ClipboardList },
    { id: 'grn', path: '/grn', label: 'Goods Received (GRN)', icon: Truck },
    { id: 'prn', path: '/prn', label: 'Product Returns (PRN)', icon: RefreshCcw },
  ];

  const marketingItems = [
    { id: 'coupons', path: '/coupons', label: 'Discount Coupons', icon: Ticket },
    { id: 'offers', path: '/offers', label: 'Auto Promotions', icon: Tag },
    { id: 'packages', path: '/packages', label: 'Product Packages', icon: PackageIcon },
    { id: 'banners', path: '/banners', label: 'Ad Banners', icon: ImageIcon },
    { id: 'broadcasts', path: '/notifications', label: 'Broadcast Center', icon: Bell },
  ];

  const logisticsContentItems = [
    { id: 'shipping', path: '/shipping-zones', label: 'Shipping Zones', icon: MapPin },
    { id: 'cms', path: '/cms-pages', label: 'CMS Pages', icon: FileText },
  ];

  const supportItems = [
    { id: 'reviews', path: '/reviews', label: 'Customer Reviews', icon: MessageSquare },
    { id: 'refunds', path: '/refunds', label: 'Refund Claims', icon: RotateCcw },
    { id: 'audit-logs', path: '/audit-logs', label: 'Audit Trail', icon: Shield },
  ];

  const userItems = [
    { id: 'customers', path: '/customers', label: 'Manage Customers', icon: Users },
    { id: 'admins', path: '/admins', label: 'Manage Admins', icon: UserCheck },
  ];

  const renderItem = (item: { id: string; path: string; label: string; icon: React.ComponentType<any> }) => {
    const Icon = item.icon;
    const isActive = item.path === '/' ? pathname === '/' || pathname === '/dashboard' : pathname.startsWith(item.path);

    return (
      <Link
        key={item.id}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
          isActive
            ? 'bg-accent dark:bg-accent text-white shadow-sm font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-cardbg-dark h-full p-4 flex flex-col gap-1 transition-all duration-200 flex-shrink-0 overflow-y-auto">
      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-1">
        Catalog & Inventory
      </div>
      {mainItems.map(renderItem)}

      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-1 mt-4">
        Marketing & Promotions
      </div>
      {marketingItems.map(renderItem)}

      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-1 mt-4">
        Logistics & Content
      </div>
      {logisticsContentItems.map(renderItem)}

      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-1 mt-4">
        Customer Support
      </div>
      {supportItems.map(renderItem)}

      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 mb-1 mt-4">
        User Management
      </div>
      {userItems.map(renderItem)}
    </aside>
  );
};
