import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementActivityType, CreateProcurementActivityTypePayload } from '../types/procurementActivityTypes';
import api from '@/services/api';

const endpoint = '/procurement-activity-types';

export const createProcurementActivityTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementActivityType>,
  undefined,
  CreateProcurementActivityTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ProcurementActivityType>>(finalUrl, payload);
    return response.data;
  },
};
