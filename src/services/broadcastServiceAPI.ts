import { apiRequest } from './api';
import type { BroadcastNotification } from '../types';

export const broadcastServiceAPI = {
  getAll: async (): Promise<BroadcastNotification[]> => {
    return apiRequest('/notifications/broadcasts');
  },

  create: async (broadcastData: {
    title: string;
    message: string;
    type?: string;
    targetAudience?: string;
    targetAudienceLabel?: string;
    scheduledAt?: string | null;
  }): Promise<BroadcastNotification> => {
    return apiRequest('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest(`/notifications/broadcasts/${id}`, {
      method: 'DELETE',
    });
  },
};
