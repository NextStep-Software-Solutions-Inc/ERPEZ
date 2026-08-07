import { PaginatedResponse, createMockPaginatedResponse, mockFiscalYears } from "@/lib/fiscal-year-and-policies/shared";
import { FiscalYear } from "@/lib/fiscal-year-and-policies/types";


export const mockGetFiscalYears = (url: string): PaginatedResponse<FiscalYear> => {
  const urlObj = new URL(url, 'http://localhost');
  const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(urlObj.searchParams.get('pageSize') || '10', 10);

  return createMockPaginatedResponse(mockFiscalYears, page, pageSize);
};
