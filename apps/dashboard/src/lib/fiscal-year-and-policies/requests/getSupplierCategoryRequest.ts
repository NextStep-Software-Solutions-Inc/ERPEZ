import type { QueryBlueprintFromTemplate, QueryKey, APIResponse } from 'erpez-shared-lib';
import type { SupplierCategory } from '../supplier-category.types';
import api from '@/services/api';

const endpoint = '/supplier-categories/:id';

export const getSupplierCategoryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SupplierCategory>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<SupplierCategory>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
