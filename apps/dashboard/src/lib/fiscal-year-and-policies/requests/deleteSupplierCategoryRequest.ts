import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import api from '@/services/api';

const endpoint = '/supplier-categories/:id';

export const deleteSupplierCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean | unknown>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<boolean | unknown>>(finalUrl);
    return response.data;
  },
};
