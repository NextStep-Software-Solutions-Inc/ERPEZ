import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { ItemCategory } from '../types';
import api from '@/services/api';

const endpoint = '/item-categories';

export const getItemCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ItemCategory>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ItemCategory>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
