import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { AgencyMasterBudget } from '../../../../lib/fiscal-year-and-policies/types';
import api from '@/services/api';

const endpoint = '/agency-master-budgets/:id';

export const getAgencyMasterBudgetRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AgencyMasterBudget>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AgencyMasterBudget>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
