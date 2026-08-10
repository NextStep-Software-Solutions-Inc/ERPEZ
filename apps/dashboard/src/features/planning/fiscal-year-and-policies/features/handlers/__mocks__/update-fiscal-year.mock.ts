import { mockFiscalYears, UpdateFiscalYearPayload, FiscalYear } from "@/lib/fiscal-year-and-policies/shared";


export const mockUpdateFiscalYear = (
  id: string,
  payload: UpdateFiscalYearPayload
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
