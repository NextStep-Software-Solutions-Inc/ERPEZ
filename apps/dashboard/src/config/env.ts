/**
 * Dynamic environment URL resolver for ERP Dashboard.
 * Respects explicit environment variables first, then resolves according to runtime domain:
 * - Production: app.erpez.net or erpez.net
 * - Development: *.vercel.app or *.dev.nextstep-software.com
 * - Localhost fallback
 */

const isBrowser = typeof window !== 'undefined';

function getHostname(): string {
  return isBrowser ? window.location.hostname : '';
}

export function isProductionEnvironment(): boolean {
  const host = getHostname();
  return host === 'app.erpez.net' || host === 'erpez.net' || host.endsWith('.erpez.net');
}

export function isDevEnvironment(): boolean {
  const host = getHostname();
  return host.includes('vercel.app') || host.includes('dev.nextstep-software.com');
}

/**
 * Returns the Tenant Management Portal UI base URL.
 * Dev: https://erpez-portal.vercel.app
 * Prod: https://erpez.net
 * Local: http://localhost:5173
 */
export function getTenantManagementUrl(): string {
  const envUrl =
    (isBrowser && (window as any).ENV?.VITE_TENANT_MANAGEMENT_URL) ||
    import.meta.env.VITE_TENANT_MANAGEMENT_URL;

  if (envUrl && envUrl.trim() && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (isProductionEnvironment()) {
    return 'https://erpez.net';
  }

  if (isDevEnvironment()) {
    return 'https://erpez-portal.vercel.app';
  }

  return envUrl?.trim() || 'http://localhost:5173';
}

/**
 * Returns the Dashboard Backend API Base URL.
 * Dev: https://erpez-app.api.dev.nextstep-software.com
 * Prod: https://app.api.erpez.net
 * Local: http://localhost:5245
 */
export function getDashboardBackendUrl(): string {
  const envUrl =
    (isBrowser && (window as any).ENV?.VITE_ERPEZ_BACKEND_URL) ||
    (isBrowser && (window as any).ENV?.VITE_API_URL) ||
    import.meta.env.VITE_ERPEZ_BACKEND_URL ||
    import.meta.env.VITE_API_URL;

  if (envUrl && envUrl.trim() && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (isProductionEnvironment()) {
    return 'https://app.api.erpez.net';
  }

  if (isDevEnvironment()) {
    return 'https://erpez-app.api.dev.nextstep-software.com';
  }

  return envUrl?.trim() || 'http://localhost:5245';
}

/**
 * Returns the Tenant Management Backend API Base URL.
 * Dev: https://erpez-portal.api.dev.nextstep-software.com
 * Prod: https://portal.api.erpez.net
 * Local: http://localhost:5246
 */
export function getTenantApiUrl(): string {
  const envUrl =
    (isBrowser && (window as any).ENV?.VITE_TENANT_API_URL) ||
    import.meta.env.VITE_TENANT_API_URL;

  if (envUrl && envUrl.trim() && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (isProductionEnvironment()) {
    return 'https://portal.api.erpez.net';
  }

  if (isDevEnvironment()) {
    return 'https://erpez-portal.api.dev.nextstep-software.com';
  }

  return envUrl?.trim() || 'http://localhost:5246';
}
