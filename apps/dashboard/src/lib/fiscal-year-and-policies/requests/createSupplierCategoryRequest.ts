import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { SupplierCategory } from '../supplier-category.types';
import api from '@/services/api';

const endpoint = '/supplier-categories';

export type CreateSupplierCategoryPayload = {
  name: string;
  description: string | null;
};

export const createSupplierCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SupplierCategory | string>,
  undefined,
  CreateSupplierCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<SupplierCategory | string>>(finalUrl, payload);
    return response.data;
  },
};
