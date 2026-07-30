import { api } from './api';
import type { Review } from '../types';

export const reviewServiceAPI = {
  getProductReviews: async (productId: string) => {
    return api.get<Review[]>(`/products/${productId}/reviews`);
  },

  deleteReview: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/reviews/${id}`);
  },
};
