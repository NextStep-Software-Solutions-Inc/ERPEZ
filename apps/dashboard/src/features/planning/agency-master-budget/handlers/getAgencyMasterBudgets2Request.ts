import { PaginationResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib';
import type { AgencyMasterBudget } from '../../../../lib/fiscal-year-and-policies/types';
import api from '@/services/api';

const endpoint = '/agency-master-budgets';

export const getAgencyMasterBudgets2Request: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<AgencyMasterBudget>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<AgencyMasterBudget>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
