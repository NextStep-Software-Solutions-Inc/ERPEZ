import {
  createAxiosInstance,
  type APIResponse,
  type PaginationResponse,
  type AxiosError,
  type AxiosResponse,
} from 'erpez-shared-lib';
import { toast } from 'sonner';
import { extractErrorMessage, extractSuccessMessage } from './utils/messages';
import { getDashboardBackendUrl } from '~/config/env';

const BLACKLISTED_CODES = ['ERR_CANCELED'];
const WHITELISTED_METHODS = ['post', 'put', 'patch', 'delete'];

export const dashboardApi = createAxiosInstance(getDashboardBackendUrl());

dashboardApi.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    let tenantId: string | null = null;

    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('erpez_auth_token');
        if (storedToken && storedToken.startsWith('ey')) {
          token = storedToken;
        }
        tenantId = localStorage.getItem('erpez_tenant_id');
      } catch {
        // Ignore
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

dashboardApi.interceptors.response.use(
  <T>(response: AxiosResponse<APIResponse<T> | PaginationResponse<T>>) => {
    if (response.config.method && WHITELISTED_METHODS.includes(response.config.method)) {
      toast.success(extractSuccessMessage(response));
    }
    return response;
  },
  (error: AxiosError) => {
    if (!BLACKLISTED_CODES.includes(error.code || '')) {
      const { description, title } = extractErrorMessage(error);
      toast.error(title, {
        description,
        id: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);
