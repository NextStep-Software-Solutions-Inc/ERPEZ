import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { BudgetCall } from '../types';
import api from '@/services/api';

const endpoint = '/budget-calls/:id';

export const getBudgetCallRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BudgetCall>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<BudgetCall>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
