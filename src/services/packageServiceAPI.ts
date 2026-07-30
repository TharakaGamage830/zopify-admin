import { api } from './api';
import type { Package } from '../types';

export const packageServiceAPI = {
  getPackages: async (includeInactive = true) => {
    return api.get<Package[]>(`/packages?includeInactive=${includeInactive}`);
  },

  getPackage: async (id: string) => {
    return api.get<Package>(`/packages/${id}`);
  },

  createPackage: async (dto: any) => {
    return api.post<Package>('/packages', dto);
  },

  updatePackage: async (id: string, dto: any) => {
    return api.patch<Package>(`/packages/${id}`, dto);
  },

  deletePackage: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/packages/${id}`);
  },
};
