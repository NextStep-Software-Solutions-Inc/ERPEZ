import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { AgencyMasterBudget } from '../../../../lib/fiscal-year-and-policies/types';
import api from '@/services/api';

const endpoint = '/agency-master-budgets';

export type CreateAgencyMasterBudgetPayload = {
  fiscalYearId: string;
  fundSourceId: string;
  sourceDocumentType: string | null;
  psAmount: number;
  mooeAmount: number;
  coAmount: number;
};

export const createAgencyMasterBudgetRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AgencyMasterBudget>,
  undefined,
  CreateAgencyMasterBudgetPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<AgencyMasterBudget>>(finalUrl, payload);
    return response.data;
  },
};
