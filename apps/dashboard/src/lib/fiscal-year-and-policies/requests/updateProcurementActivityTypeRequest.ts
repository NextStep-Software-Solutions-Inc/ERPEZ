import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementActivityType, UpdateProcurementActivityTypePayload } from '../types/procurementActivityTypes';
import api from '@/services/api';

const endpoint = '/procurement-activity-types/:id';

export const updateProcurementActivityTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementActivityType>,
  undefined,
  UpdateProcurementActivityTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ProcurementActivityType>>(finalUrl, payload);
    return response.data;
  },
};
