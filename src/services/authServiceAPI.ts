import { api } from './api';

export const authServiceAPI = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },

  logout: async (refreshToken: string | null) => {
    return api.post('/auth/logout', { refreshToken });
  }
};
