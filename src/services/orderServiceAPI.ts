import { api } from './api';
import type { Order } from '../types';

export const orderServiceAPI = {
  getOrders: async () => {
    return api.get<Order[]>('/orders');
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    return api.patch<Order>(`/orders/${orderId}/status`, { status });
  },

  updateOrderPayment: async (orderId: string, paymentStatus: string) => {
    return api.patch<Order>(`/orders/${orderId}/payment`, { paymentStatus });
  }
};
