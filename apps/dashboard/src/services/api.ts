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

// Request interceptor to add Keycloak token
api.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`
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
    if (!BLACKLISTED_CODES.includes(error.code || '')) {
      const msg = extractErrorMessage(error)
      if (msg) {
        toast.error(msg, { id: msg })
      }
    }

    return Promise.reject(error)
  },
)

export default api
