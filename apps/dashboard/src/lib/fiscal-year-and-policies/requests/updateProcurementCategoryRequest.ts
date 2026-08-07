import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementCategory } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-categories/:id';

export type UpdateProcurementCategoryPayload = {
  name?: string;
  description?: string | null;
};

export const updateProcurementCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementCategory>,
  undefined,
  UpdateProcurementCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ProcurementCategory>>(finalUrl, payload);
    return response.data;
  },
};
