import { api } from './api';

export type UserRole =
  | 'customer'
  | 'super_admin'
  | 'admin'
  | 'catalog_manager'
  | 'order_manager'
  | 'support_agent'
  | 'staff';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const userServiceAPI = {
  getUsers: async (role?: string) => {
    const path = role ? `/users?role=${role}` : '/users';
    return api.get<User[]>(path);
  },

  createUser: async (data: any) => {
    return api.post<User>('/users', data);
  },

  updateUser: async (id: string, data: any) => {
    return api.patch<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/users/${id}`);
  },

  updateProfile: async (data: any) => {
    return api.patch<User>('/users/profile', data);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/users/avatar', formData);
  },
};
