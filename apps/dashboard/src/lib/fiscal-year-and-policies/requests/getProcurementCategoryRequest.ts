import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { ProcurementCategory } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-categories/:id';

export const getProcurementCategoryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementCategory>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProcurementCategory>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
