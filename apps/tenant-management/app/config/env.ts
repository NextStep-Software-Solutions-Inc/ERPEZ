/**
 * Dynamic environment URL resolver for Tenant Management.
 * Respects explicit environment variables first, then resolves according to runtime domain:
 * - Production: erpez.net
 * - Development: *.vercel.app or *.dev.nextstep-software.com
 * - Localhost fallback
 */

const isBrowser = typeof window !== 'undefined';

function getHostname(): string {
  return isBrowser ? window.location.hostname : '';
}

export function isProductionEnvironment(): boolean {
  const host = getHostname();
  return host === 'erpez.net' || host.endsWith('.erpez.net');
}

export function isDevEnvironment(): boolean {
  const host = getHostname();
  return host.includes('vercel.app') || host.includes('dev.nextstep-software.com');
}

/**
 * Returns the ERP Dashboard UI base URL.
 * Dev: https://erpez-app.vercel.app
 * Prod: https://app.erpez.net
 * Local: http://localhost:3000
 */
export function getDashboardUrl(): string {
  const envUrl =
    (isBrowser && (window as any).ENV?.VITE_ERP_DASHBOARD_URL) ||
    (isBrowser && (window as any).ENV?.VITE_DASHBOARD_URL) ||
    import.meta.env.VITE_ERP_DASHBOARD_URL ||
    import.meta.env.VITE_DASHBOARD_URL;

  if (envUrl && envUrl.trim() && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (isProductionEnvironment()) {
    return 'https://app.erpez.net';
  }

  if (isDevEnvironment()) {
    return 'https://erpez-app.vercel.app';
  }

  return envUrl?.trim() || 'http://localhost:3000';
}

/**
 * Returns the Tenant Management Backend API Base URL.
 * Dev: https://erpez-portal.api.dev.nextstep-software.com
 * Prod: https://portal.api.erpez.net
 * Local: http://localhost:5246
 */
export function getTenantBackendUrl(): string {
  const envUrl =
    (isBrowser && (window as any).ENV?.VITE_ERPEZ_BACKEND_URL) ||
    import.meta.env.VITE_ERPEZ_BACKEND_URL;

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

/**
 * Returns the Dashboard Backend API Base URL.
 * Dev: https://erpez-app.api.dev.nextstep-software.com
 * Prod: https://app.api.erpez.net
 * Local: http://localhost:5245
 */
export function getDashboardBackendUrl(): string {
  const envUrl =
    (isBrowser && (window as any).ENV?.VITE_DASHBOARD_BACKEND_URL) ||
    import.meta.env.VITE_DASHBOARD_BACKEND_URL ||
    import.meta.env.VITE_DASHBOARD_API_URL;

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
