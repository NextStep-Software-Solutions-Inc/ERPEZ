import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isProductionEnvironment,
  isDevEnvironment,
  getDashboardUrl,
  getTenantBackendUrl,
  getDashboardBackendUrl,
} from '../../../tenant-management/app/config/env';

describe('Tenant Management Environment URL Resolver (tenant-management env.ts)', () => {
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
    it('returns true for erpez.net and *.erpez.net', () => {
      setHostname('erpez.net');
      expect(isProductionEnvironment()).toBe(true);

      setHostname('portal.erpez.net');
      expect(isProductionEnvironment()).toBe(true);
    });

    it('returns false for vercel and localhost', () => {
      setHostname('erpez-portal.vercel.app');
      expect(isProductionEnvironment()).toBe(false);

      setHostname('localhost');
      expect(isProductionEnvironment()).toBe(false);
    });
  });

  describe('isDevEnvironment', () => {
    it('returns true for vercel and dev.nextstep-software.com hostnames', () => {
      setHostname('erpez-portal.vercel.app');
      expect(isDevEnvironment()).toBe(true);

      setHostname('portal.dev.nextstep-software.com');
      expect(isDevEnvironment()).toBe(true);
    });

    it('returns false for erpez.net and localhost', () => {
      setHostname('erpez.net');
      expect(isDevEnvironment()).toBe(false);

      setHostname('localhost');
      expect(isDevEnvironment()).toBe(false);
    });
  });

  describe('getDashboardUrl', () => {
    it('resolves to production app URL on erpez.net', () => {
      setHostname('erpez.net');
      expect(getDashboardUrl()).toBe('https://app.erpez.net');
    });

    it('resolves to vercel app URL on dev environments', () => {
      setHostname('erpez-portal.vercel.app');
      expect(getDashboardUrl()).toBe('https://erpez-app.vercel.app');
    });

    it('falls back to http://localhost:3000 on local', () => {
      setHostname('localhost');
      expect(getDashboardUrl()).toBe('http://localhost:3000');
    });

    it('bypasses localhost environment variables when deployed to cloud preview domains', () => {
      setHostname('erpez-portal.vercel.app');
      (window as any).ENV = {
        VITE_ERP_DASHBOARD_URL: 'http://localhost:3000',
      };
      expect(getDashboardUrl()).toBe('https://erpez-app.vercel.app');
    });
  });

  describe('getTenantBackendUrl', () => {
    it('resolves to production portal API on erpez.net', () => {
      setHostname('erpez.net');
      expect(getTenantBackendUrl()).toBe('https://portal.api.erpez.net');
    });

    it('resolves to dev portal API on dev environments', () => {
      setHostname('erpez-portal.vercel.app');
      expect(getTenantBackendUrl()).toBe('https://erpez-portal.api.dev.nextstep-software.com');
    });

    it('falls back to http://localhost:5246 on local', () => {
      setHostname('localhost');
      vi.stubEnv('VITE_ERPEZ_BACKEND_URL', '');
      expect(getTenantBackendUrl()).toBe('http://localhost:5246');
    });
  });

  describe('getDashboardBackendUrl', () => {
    it('resolves to production dashboard API on erpez.net', () => {
      setHostname('erpez.net');
      expect(getDashboardBackendUrl()).toBe('https://app.api.erpez.net');
    });

    it('resolves to dev dashboard API on dev environments', () => {
      setHostname('erpez-portal.vercel.app');
      expect(getDashboardBackendUrl()).toBe('https://erpez-app.api.dev.nextstep-software.com');
    });

    it('falls back to http://localhost:5245 on local', () => {
      setHostname('localhost');
      expect(getDashboardBackendUrl()).toBe('http://localhost:5245');
    });
  });
});
