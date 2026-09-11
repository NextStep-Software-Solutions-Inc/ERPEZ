import {
  createAxiosInstance,
  type APIResponse,
  type PaginationResponse,
  type AxiosError,
  type AxiosResponse,
} from "erpez-shared-lib";
import { toast } from "sonner";
import { extractErrorMessage, extractSuccessMessage } from "./utils/messages";

const BLACKLISTED_CODES = ["ERR_CANCELED"];
const WHITELISTED_METHODS = ["post", "put", "patch", "delete"];

export const api = createAxiosInstance(import.meta.env.VITE_ERPEZ_BACKEND_URL || "http://localhost:5246");

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use(
  (config) => {
    let token = authToken;
    let tenantId = "00000000-0000-0000-0000-000000000001";

    if (typeof window !== "undefined") {
      try {
        const storedToken = localStorage.getItem("erpez_auth_token");
        if (storedToken && storedToken.startsWith("ey")) {
          token = storedToken;
        }
        tenantId = localStorage.getItem("erpez_tenant_id") || tenantId;
      } catch {
        // Ignore localStorage access errors
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers["X-Tenant-Id"] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  <T>(response: AxiosResponse<APIResponse<T> | PaginationResponse<T>>) => {
    if (response.config.method && WHITELISTED_METHODS.includes(response.config.method)) {
      toast.success(extractSuccessMessage(response));
    }
    return response;
  },
  (error: AxiosError) => {
    if (!BLACKLISTED_CODES.includes(error.code || "") && error.response?.status !== 404) {
      const { description, title } = extractErrorMessage(error);
      toast.error(title, {
        description,
        id: error.config?.url
      });
    }
    return Promise.reject(error);
  }
);