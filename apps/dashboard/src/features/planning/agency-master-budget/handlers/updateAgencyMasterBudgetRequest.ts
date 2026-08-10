import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { AgencyMasterBudget } from '../../../../lib/fiscal-year-and-policies/types';
import api from '@/services/api';

const endpoint = '/agency-master-budgets/:id';

export type UpdateAgencyMasterBudgetPayload = {
  fiscalYearId: string;
  fundSourceId: string;
  sourceDocumentType: string | null;
  psAmount: number;
  mooeAmount: number;
  coAmount: number;
};

export const updateAgencyMasterBudgetRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AgencyMasterBudget>,
  undefined,
  UpdateAgencyMasterBudgetPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<AgencyMasterBudget>>(finalUrl, payload);
    return response.data;
  },
};
