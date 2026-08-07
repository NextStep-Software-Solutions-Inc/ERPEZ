import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementPolicyConfig } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-policy-configs';

export type CreateProcurementPolicyConfigPayload = {
  fiscalYearId: string;
  organizationId?: string;
  procurementModeId: string;
  procurementModeThresholdId: string;
  minAmount: number;
  maxAmount?: number;
};

export const createProcurementPolicyConfigRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementPolicyConfig>,
  undefined,
  CreateProcurementPolicyConfigPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ProcurementPolicyConfig>>(finalUrl, payload);
    return response.data;
  },
};
