import { createAxiosInstance } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { extractErrorMessage, extractSuccessMessage } from './utils/messages'
import type {
  APIResponse,
  AxiosError,
  PaginationResponse,
  AxiosResponse,
} from 'erpez-shared-lib'
import { getAuthToken, getCandidateTenantId, refreshAuthToken } from '@/auth/authBridge'

const BLACKLISTED_CODES = ['ERR_CANCELED']
const WHITELISTED_METHODS = ['post', 'put', 'patch', 'delete']

export const api = createAxiosInstance(import.meta.env.VITE_ERPEZ_BACKEND_URL)
api.defaults.timeout = 30000 // 30s timeout to allow database operations and debugging without premature frontend timeouts

// Request interceptor to add IdP token and Tenant ID via unified auth bridge
api.interceptors.request.use(
  async (config) => {
    let token: string | null = null

    try {
      token = await getAuthToken()
    } catch {
      // Ignore bridge errors
    }

    if (!token && typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('erpez_auth_token')
        if (storedToken && storedToken.startsWith('ey')) {
          token = storedToken
        } else if (storedToken) {
          localStorage.removeItem('erpez_auth_token')
        }
      } catch {
        // Ignore localStorage access errors
      }
    }

    if (token && token.startsWith('ey')) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Tenant Header Propagation:
    // Attached as X-Tenant-Id and X-Tenant-Name
    const candidateTenant = getCandidateTenantId()
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    let effectiveTenantId: string | null = null

    if (candidateTenant && guidRegex.test(candidateTenant)) {
      effectiveTenantId = candidateTenant
    } else if (typeof window !== 'undefined') {
      const stored =
        sessionStorage.getItem('erpez_candidate_tenant_id') ||
        localStorage.getItem('erpez_tenant_id')
      if (stored && guidRegex.test(stored)) {
        effectiveTenantId = stored
      } else {
        const storedName =
          sessionStorage.getItem('erpez_tenant_name') ||
          localStorage.getItem('erpez_tenant_name')
        if (storedName && storedName.toLowerCase().includes('nextjump')) {
          effectiveTenantId = '01a0d69d-924b-762c-a774-523a30544619'
        }
      }
    }

    if (effectiveTenantId) {
      config.headers['X-Tenant-Id'] = effectiveTenantId
    } else {
      delete config.headers['X-Tenant-Id']
    }

    if (typeof window !== 'undefined') {
      const tenantName =
        sessionStorage.getItem('erpez_tenant_name') ||
        localStorage.getItem('erpez_tenant_name')
      if (tenantName) {
        config.headers['X-Tenant-Name'] = tenantName
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Combined response interceptor to handle both toast notifications and token expiration
api.interceptors.response.use(
  <T>(response: AxiosResponse<APIResponse<T> | PaginationResponse<T>>) => {
    // Show success toast for whitelisted methods
    if (
      response.config.method &&
      WHITELISTED_METHODS.includes(response.config.method)
    ) {
      toast.success(extractSuccessMessage(response))
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Handle 401 errors with token refresh via unified bridge
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshed = await refreshAuthToken(5)
        if (refreshed) {
          const freshToken = await getAuthToken()
          if (freshToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${freshToken}`
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        return Promise.reject(refreshError)
      }
    }

    // Show error toast for non-blacklisted error codes with deduplication ID
    const skipToast = (error.config as any)?.skipToast || (error.config as any)?.headers?.['x-skip-toast']
    if (!skipToast && !BLACKLISTED_CODES.includes(error.code || '')) {
      const msg = extractErrorMessage(error)
      if (msg) {
        toast.error(msg, { id: msg })
      }
    }

    return Promise.reject(error)
  },
)

export default api
