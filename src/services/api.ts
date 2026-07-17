const API_BASE_URL = 'http://localhost:3000/api/v1';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export const getAccessToken = () => localStorage.getItem('admin_accessToken');
export const getRefreshToken = () => localStorage.getItem('admin_refreshToken');
export const getUser = () => {
  const user = localStorage.getItem('admin_user');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (accessToken: string, refreshToken: string, user: any) => {
  localStorage.setItem('admin_accessToken', accessToken);
  localStorage.setItem('admin_refreshToken', refreshToken);
  localStorage.setItem('admin_user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('admin_accessToken');
  localStorage.removeItem('admin_refreshToken');
  localStorage.removeItem('admin_user');
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setAuth(data.accessToken, data.refreshToken, data.user);
            isRefreshing = false;
            onRefreshed(data.accessToken);
          } else {
            isRefreshing = false;
            clearAuth();
            window.location.reload();
            throw new Error('Refresh token expired');
          }
        } catch (err) {
          isRefreshing = false;
          clearAuth();
          window.location.reload();
          throw err;
        }
      }

      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            headers.set('Authorization', `Bearer ${newToken}`);
            const retryRes = await fetch(url, { ...options, headers });
            if (!retryRes.ok) {
              const errData = await retryRes.json().catch(() => ({}));
              reject({ statusCode: retryRes.status, ...errData } as ApiError);
            } else {
              resolve(await retryRes.json());
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  if (!response.ok) {
    if (response.status === 204) {
      return {} as T;
    }
    const errData = await response.json().catch(() => ({}));
    throw { statusCode: response.status, ...errData } as ApiError;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T = any>(path: string, options?: RequestInit) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T = any>(path: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = any>(path: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(path: string, options?: RequestInit) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
