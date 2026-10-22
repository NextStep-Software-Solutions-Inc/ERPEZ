import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isProductionEnvironment,
  isDevEnvironment,
  getTenantManagementUrl,
  getDashboardBackendUrl,
  getTenantApiUrl,
} from './env';

describe('Environment URL Resolver (env.ts)', () => {
  const originalLocation = window.location;

  function setHostname(hostname: string) {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hostname,
      },
      writable: true,
      configurable: true,
    });
  }

  beforeEach(() => {
    delete (window as any).ENV;
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    delete (window as any).ENV;
    vi.unstubAllEnvs();
  });

  describe('isProductionEnvironment', () => {
    it('returns true for app.erpez.net', () => {
      setHostname('app.erpez.net');
      expect(isProductionEnvironment()).toBe(true);
    });

    it('returns true for erpez.net', () => {
      setHostname('erpez.net');
      expect(isProductionEnvironment()).toBe(true);
    });

    it('returns true for subdomains ending with .erpez.net', () => {
      setHostname('custom.erpez.net');
      expect(isProductionEnvironment()).toBe(true);
    });

    it('returns false for development or localhost domains', () => {
      setHostname('erpez-app.vercel.app');
      expect(isProductionEnvironment()).toBe(false);

      setHostname('localhost');
      expect(isProductionEnvironment()).toBe(false);
    });
  });

  describe('isDevEnvironment', () => {
    it('returns true for vercel preview deployments', () => {
      setHostname('erpez-app.vercel.app');
      expect(isDevEnvironment()).toBe(true);

      setHostname('erpez-app-git-feature-branch.vercel.app');
      expect(isDevEnvironment()).toBe(true);
    });

    it('returns true for dev.nextstep-software.com hostnames', () => {
      setHostname('app.dev.nextstep-software.com');
      expect(isDevEnvironment()).toBe(true);
    });

    it('returns false for production and localhost domains', () => {
      setHostname('app.erpez.net');
      expect(isDevEnvironment()).toBe(false);

      setHostname('localhost');
      expect(isDevEnvironment()).toBe(false);
    });
  });

  describe('getTenantManagementUrl', () => {
    it('resolves to production URL when running on app.erpez.net', () => {
      setHostname('app.erpez.net');
      expect(getTenantManagementUrl()).toBe('https://erpez.net');
    });

    it('resolves to vercel portal URL when running on development domains', () => {
      setHostname('erpez-app.vercel.app');
      expect(getTenantManagementUrl()).toBe('https://erpez-portal.vercel.app');

      setHostname('app.dev.nextstep-software.com');
      expect(getTenantManagementUrl()).toBe('https://erpez-portal.vercel.app');
    });

    it('falls back to localhost:5173 when running on localhost with no explicit env', () => {
      setHostname('localhost');
      expect(getTenantManagementUrl()).toBe('http://localhost:5173');
    });

    it('prefers valid non-localhost explicit env variable over domain resolution', () => {
      setHostname('localhost');
      (window as any).ENV = {
        VITE_TENANT_MANAGEMENT_URL: 'https://custom-portal.example.com/',
      };
      expect(getTenantManagementUrl()).toBe('https://custom-portal.example.com');
    });

    it('bypasses localhost env variable on cloud development hostnames to prevent breaking previews', () => {
      setHostname('erpez-app.vercel.app');
      (window as any).ENV = {
        VITE_TENANT_MANAGEMENT_URL: 'http://localhost:5173',
      };
      expect(getTenantManagementUrl()).toBe('https://erpez-portal.vercel.app');
    });
  });

  describe('getDashboardBackendUrl', () => {
    it('resolves to production API when running on app.erpez.net', () => {
      setHostname('app.erpez.net');
      expect(getDashboardBackendUrl()).toBe('https://app.api.erpez.net');
    });

    it('resolves to dev API when running on development domains', () => {
      setHostname('erpez-app.vercel.app');
      expect(getDashboardBackendUrl()).toBe('https://erpez-app.api.dev.nextstep-software.com');

      setHostname('app.dev.nextstep-software.com');
      expect(getDashboardBackendUrl()).toBe('https://erpez-app.api.dev.nextstep-software.com');
    });

    it('falls back to localhost:5245 on local environment', () => {
      setHostname('localhost');
      expect(getDashboardBackendUrl()).toBe('http://localhost:5245');
    });

    it('respects explicit runtime ENV variable without trailing slashes', () => {
      setHostname('localhost');
      (window as any).ENV = {
        VITE_ERPEZ_BACKEND_URL: 'https://custom-api.example.com/api/',
      };
      expect(getDashboardBackendUrl()).toBe('https://custom-api.example.com/api');
    });
  });

  describe('getTenantApiUrl', () => {
    it('resolves to production portal API on app.erpez.net', () => {
      setHostname('app.erpez.net');
      expect(getTenantApiUrl()).toBe('https://portal.api.erpez.net');
    });

    it('resolves to dev portal API on development domains', () => {
      setHostname('erpez-app.vercel.app');
      expect(getTenantApiUrl()).toBe('https://erpez-portal.api.dev.nextstep-software.com');
    });

    it('falls back to localhost:5246 on local environment', () => {
      setHostname('localhost');
      expect(getTenantApiUrl()).toBe('http://localhost:5246');
    });

    it('respects explicit runtime ENV variable', () => {
      setHostname('localhost');
      (window as any).ENV = {
        VITE_TENANT_API_URL: 'https://custom-tenant-api.example.com',
      };
      expect(getTenantApiUrl()).toBe('https://custom-tenant-api.example.com');
    });
  });
});
