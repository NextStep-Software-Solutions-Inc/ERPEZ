import { CreateFiscalYearPayload, FiscalYear } from "@/lib/fiscal-year-and-policies/shared";

export const mockCreateFiscalYear = (payload: CreateFiscalYearPayload): FiscalYear => {
  return {
    ...payload,
    id: `fy-${Date.now()}`,
    isLocked: false,
    isArchived: false,
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
