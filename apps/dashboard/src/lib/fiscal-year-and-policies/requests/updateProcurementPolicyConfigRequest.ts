import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementPolicyConfig } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-policy-configs/:id';

export type UpdateProcurementPolicyConfigPayload = {
  procurementModeThresholdId?: string;
  minAmount?: number;
  maxAmount?: number;
};

export const updateProcurementPolicyConfigRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementPolicyConfig>,
  undefined,
  UpdateProcurementPolicyConfigPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ProcurementPolicyConfig>>(finalUrl, payload);
    return response.data;
  },
};
