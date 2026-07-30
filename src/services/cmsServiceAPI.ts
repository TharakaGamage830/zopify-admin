import { api } from './api';
import type { CmsPage } from '../types';

export const cmsServiceAPI = {
  getPages: async (all = true, type?: string) => {
    const query = type ? `?all=${all}&type=${type}` : `?all=${all}`;
    return api.get<CmsPage[]>(`/cms${query}`);
  },

  getPageBySlug: async (slug: string) => {
    return api.get<CmsPage>(`/cms/${slug}`);
  },

  createPage: async (dto: any) => {
    return api.post<CmsPage>('/cms', dto);
  },

  updatePage: async (id: string, dto: any) => {
    return api.patch<CmsPage>(`/cms/${id}`, dto);
  },

  deletePage: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/cms/${id}`);
  },
};
