import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { ProcurementCategory } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-categories';

export const getProcurementCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementCategory>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ProcurementCategory>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
