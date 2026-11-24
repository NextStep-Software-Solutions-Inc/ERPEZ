import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ItemCategory } from '../types';
import api from '@/services/api';

const endpoint = '/item-categories/:id';

export type UpdateItemCategoryPayload = {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export const updateItemCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ItemCategory>,
  undefined,
  UpdateItemCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ItemCategory>>(finalUrl, payload);
    return response.data;
  },
};
