import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ItemCategory } from '../types';
import api from '@/services/api';

const endpoint = '/item-categories';

export type CreateItemCategoryPayload = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export const createItemCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ItemCategory>,
  undefined,
  CreateItemCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ItemCategory>>(finalUrl, payload);
    return response.data;
  },
};
