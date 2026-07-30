import { api } from './api';
import type { Coupon, Offer } from '../types';

export const couponServiceAPI = {
  getCoupons: async () => {
    return api.get<Coupon[]>('/coupons');
  },

  createCoupon: async (dto: any) => {
    return api.post<Coupon>('/coupons', dto);
  },

  updateCoupon: async (id: string, dto: any) => {
    return api.patch<Coupon>(`/coupons/${id}`, dto);
  },

  deleteCoupon: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/coupons/${id}`);
  },

  getOffers: async () => {
    return api.get<Offer[]>('/offers');
  },

  createOffer: async (dto: any) => {
    return api.post<Offer>('/offers', dto);
  },

  deleteOffer: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/offers/${id}`);
  },
};
