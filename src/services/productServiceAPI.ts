import { api } from './api';
import type { Product, Category } from '../types';

export const productServiceAPI = {
  getProducts: async () => {
    return api.get<{ items: Product[]; total: number }>('/products?limit=100');
  },

  createProduct: async (formData: any) => {
    return api.post<Product>('/products', formData);
  },

  updateProduct: async (id: string, formData: any) => {
    return api.patch<Product>(`/products/${id}`, formData);
  },

  deleteProduct: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/products/${id}`);
  },

  getCategories: async () => {
    return api.get<Category[]>('/categories');
  },

  createCategory: async (name: string, slug: string, parentId?: string) => {
    return api.post<Category>('/categories', { name, slug, parentId });
  },

  deleteCategory: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/categories/${id}`);
  }
};
