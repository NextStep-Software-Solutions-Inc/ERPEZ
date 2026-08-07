import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementCategory } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-categories';

export type CreateProcurementCategoryPayload = {
  name: string;
  description: string | null;
};

export const createProcurementCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementCategory>,
  undefined,
  CreateProcurementCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ProcurementCategory>>(finalUrl, payload);
    return response.data;
  },
};
