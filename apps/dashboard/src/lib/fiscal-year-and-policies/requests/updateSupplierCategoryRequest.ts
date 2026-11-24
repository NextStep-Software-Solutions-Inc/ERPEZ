import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { SupplierCategory } from '../supplier-category.types';
import api from '@/services/api';

const endpoint = '/supplier-categories/:id';

export type UpdateSupplierCategoryPayload = {
  name?: string;
  description?: string | null;
};

export const updateSupplierCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SupplierCategory | unknown>,
  undefined,
  UpdateSupplierCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<SupplierCategory | unknown>>(finalUrl, payload);
    return response.data;
  },
};
