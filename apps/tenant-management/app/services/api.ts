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
let authTokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setAuthTokenGetter = (getter: (() => Promise<string | null>) | null) => {
  authTokenGetter = getter;
};

api.interceptors.request.use(
  async (config) => {
    let token = authToken;

    if (authTokenGetter) {
      try {
        const fresh = await authTokenGetter();
        if (fresh) {
          token = fresh;
          authToken = fresh;
        }
      } catch {
        // Fall back to current in-memory token
      }
    }

    let tenantId: string | null = null;

    if (typeof window !== "undefined") {
      try {
        const storedToken = localStorage.getItem("erpez_auth_token");
        if (!token && storedToken && storedToken.startsWith("ey")) {
          token = storedToken;
        }
        tenantId = localStorage.getItem("erpez_tenant_id");
        if (localStorage.getItem("erpez_is_super_admin") === "true") {
          config.headers["X-Super-Admin"] = "true";
        }
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