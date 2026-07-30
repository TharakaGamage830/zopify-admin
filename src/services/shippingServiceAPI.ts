import { api } from './api';
import type { ShippingZone } from '../types';

export const shippingServiceAPI = {
  getZones: async () => {
    return api.get<ShippingZone[]>('/shipping/zones');
  },

  createZone: async (dto: any) => {
    return api.post<ShippingZone>('/shipping/zones', dto);
  },

  updateZone: async (id: string, dto: any) => {
    return api.patch<ShippingZone>(`/shipping/zones/${id}`, dto);
  },

  deleteZone: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/shipping/zones/${id}`);
  },
};
