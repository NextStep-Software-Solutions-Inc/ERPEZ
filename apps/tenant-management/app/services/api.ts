import {
  createAxiosInstance,
  type APIResponse,
  type PaginationResponse,
  type AxiosError,
} from "erpez-shared-lib";
import type { AxiosResponse } from "erpez-shared-lib/dist/services/api";
import { toast } from "sonner";
import { extractErrorMessage, extractSuccessMessage } from "./utils/messages";

const BLACKLISTED_CODES = ["ERR_CANCELED"];
const WHITELISTED_METHODS = ["post", "put", "patch", "delete"];

export const api = createAxiosInstance(import.meta.env.VITE_ERPEZ_BACKEND_URL);

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
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
    if (!BLACKLISTED_CODES.includes(error.code || "")) {
      const { description, title } = extractErrorMessage(error);
      toast.error(title, {
        description,
        id: error.config?.url
      });
    }
    return Promise.reject(error);
  }
);