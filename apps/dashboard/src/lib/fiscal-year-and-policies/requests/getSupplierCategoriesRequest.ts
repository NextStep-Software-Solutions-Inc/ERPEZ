import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { SupplierCategory } from '../supplier-category.types';
import api from '@/services/api';

const endpoint = '/supplier-categories';

export const getSupplierCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<SupplierCategory>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<SupplierCategory>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
