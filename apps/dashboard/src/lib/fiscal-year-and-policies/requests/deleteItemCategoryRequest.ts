import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import api from '@/services/api';

const endpoint = '/item-categories/:id';

export const deleteItemCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<void>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<void>>(finalUrl);
    return response.data;
  },
};
