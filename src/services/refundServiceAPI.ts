import { api } from './api';
import type { RefundRequest } from '../types';

export const refundServiceAPI = {
  getRefunds: async () => {
    return api.get<RefundRequest[]>('/refunds');
  },

  updateRefundStatus: async (id: string, dto: { status: string; adminNotes?: string; refundAmount?: number }) => {
    return api.patch<RefundRequest>(`/refunds/${id}`, dto);
  },
};
