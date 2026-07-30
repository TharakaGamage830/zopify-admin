import { api } from './api';
import type { Banner } from '../types';

export const bannerServiceAPI = {
  getBanners: async (includeInactive = true) => {
    return api.get<Banner[]>(`/banners?includeInactive=${includeInactive}`);
  },

  createBanner: async (dto: any) => {
    return api.post<Banner>('/banners', dto);
  },

  updateBanner: async (id: string, dto: any) => {
    return api.patch<Banner>(`/banners/${id}`, dto);
  },

  deleteBanner: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/banners/${id}`);
  },
};
