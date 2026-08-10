import axios from "axios";
import keycloak from '@/auth/keycloak'; // direct ESM import of the shared instance

const baseURL = process.env.NEXT_PUBLIC_SITE_URL + "/api";

export const api = axios.create({
  baseURL,
});

// attach token automatically so individual modules don't need to set headers
api.interceptors.request.use((config) => {
  const token = keycloak?.token;
  if (token) {
    config.headers = config.headers ?? {};
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
