import { api } from './api';
import type { DashboardSummary } from '../types';

export const dashboardServiceAPI = {
  getSummary: async () => {
    return api.get<DashboardSummary>('/dashboard/summary');
  }
};
