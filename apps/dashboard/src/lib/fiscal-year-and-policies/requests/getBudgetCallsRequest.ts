import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { BudgetCall } from '../types';
import api from '@/services/api';

const endpoint = '/budget-calls';

export const getBudgetCallsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<BudgetCall>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<BudgetCall>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
