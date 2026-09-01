import { createAxiosInstance } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { extractErrorMessage, extractSuccessMessage } from './utils/messages'
import type {
  APIResponse,
  AxiosError,
  PaginationResponse,
  AxiosResponse,
} from 'erpez-shared-lib'
import keycloak from '@/auth/keycloak'

const BLACKLISTED_CODES = ['ERR_CANCELED']
const WHITELISTED_METHODS = ['post', 'put', 'patch', 'delete']

export const api = createAxiosInstance(import.meta.env.VITE_ERPEZ_BACKEND_URL)
api.defaults.timeout = 30000 // 30s timeout to allow database operations and debugging without premature frontend timeouts

// Request interceptor to add Keycloak/Dev token and Tenant ID
api.interceptors.request.use(
  (config) => {
    let token: string | null = null
    let tenantId = '00000000-0000-0000-0000-000000000001'

    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('erpez_auth_token')
        if (storedToken && storedToken.startsWith('ey')) {
          token = storedToken
        } else if (storedToken) {
          localStorage.removeItem('erpez_auth_token')
        } else if (keycloak?.token) {
          token = keycloak.token
        }
        tenantId = localStorage.getItem('erpez_tenant_id') || tenantId
      } catch {
        // Ignore localStorage access errors
      }
    } else if (keycloak?.token) {
      token = keycloak.token
    }

    if (token && token.startsWith('ey')) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId
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

    // Handle 401 errors with token refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const TOKEN_MIN_VALIDITY_SECONDS = 5
        const refreshed = await keycloak.updateToken(TOKEN_MIN_VALIDITY_SECONDS)

        if (refreshed && keycloak.token) {
          // Update the authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${keycloak.token}`
          }
          // Retry the original request
          return api(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        console.error('Token refresh failed:', refreshError)
        keycloak.logout()
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
