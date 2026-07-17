import React from 'react';
import type { Order } from '../types';
import { OrdersTable } from '../components/sections/OrdersTable';

interface OrdersPageProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onUpdatePayment: (id: string, paymentStatus: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onUpdateStatus, onUpdatePayment }) => {
  return (
    <div className="text-left animate-in fade-in duration-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">User Orders</h1>
        <p className="text-xs text-slate-400 mt-1">Track orders lifecycle, processing steps, and checkout payment status.</p>
      </div>

      <OrdersTable
        orders={orders}
        onUpdateStatus={onUpdateStatus}
        onUpdatePayment={onUpdatePayment}
      />
    </div>
  );
};
