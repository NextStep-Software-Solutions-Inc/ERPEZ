/**
 * Mock implementations for Fiscal Year handlers
 * Used when VITE_USE_MOCK=true in development
 */

import { createMockPaginatedResponse, FiscalYear, mockFiscalYears, PaginatedResponse } from "@/lib/fiscal-year-and-policies/shared";  

export const mockGetFiscalYears = (url: string): PaginatedResponse<FiscalYear> => {
  const urlObj = new URL(url, 'http://localhost');
  const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(urlObj.searchParams.get('pageSize') || '10', 10);
  const searchTerm = urlObj.searchParams.get('searchTerm') || '';
  const status = urlObj.searchParams.get('status');

  let filtered = mockFiscalYears;

  // Apply status filter
  if (status) {
    filtered = filtered.filter((fy) => fy.status === status);
  }

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(
      (fy) =>
        fy.yearNumber.toString().includes(searchTerm) ||
        fy.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return createMockPaginatedResponse(filtered, page, pageSize);
};

export const mockGetFiscalYear = (url: string): FiscalYear => {
  const id = url.split('/').pop();
  const fy = mockFiscalYears.find((f) => f.id === id);

  if (!fy) {
    throw new Error(`Fiscal year not found: ${id}`);
  }

  return fy;
};

export const mockCreateFiscalYear = (payload: Omit<FiscalYear, 'id' | 'createdAt' | 'updatedAt'>): FiscalYear => {
  const newFY: FiscalYear = {
    ...payload,
    id: `fy-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // In real mock, you'd push to mockFiscalYears
  // For now, just return the created object
  return newFY;
};

export const mockUpdateFiscalYear = (
  id: string,
  payload: Partial<Omit<FiscalYear, 'id' | 'createdAt' | 'updatedAt'>>
): FiscalYear => {
  const fy = mockFiscalYears.find((f) => f.id === id);

  if (!fy) {
    throw new Error(`Fiscal year not found: ${id}`);
  }

  return {
    ...fy,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
};

export const mockDeleteFiscalYear = (id: string): { success: boolean; id: string } => {
  const index = mockFiscalYears.findIndex((f) => f.id === id);

  if (index === -1) {
    throw new Error(`Fiscal year not found: ${id}`);
  }

  // In real mock, you'd splice from mockFiscalYears
  // For now, just return success
  return { success: true, id };
};
