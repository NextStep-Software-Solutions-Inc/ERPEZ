import { FiscalYear, mockFiscalYears } from "@/lib/fiscal-year-and-policies/shared"; 

export const mockGetFiscalYear = (url: string): FiscalYear => {
  const id = url.split('/').pop();
  const fy = mockFiscalYears.find((f) => f.id === id);

  if (!fy) {
    throw new Error(`Fiscal year not found: ${id}`);
  }

  return fy;
};
