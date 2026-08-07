import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementModeThreshold } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-mode-thresholds/:id';

export type UpdateProcurementModeThresholdPayload = {
  minThreshold?: number;
  maxThreshold?: number;
  effectivityStart?: Date;
  effectivityEnd?: Date;
};

export const updateProcurementModeThresholdRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementModeThreshold>,
  undefined,
  UpdateProcurementModeThresholdPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ProcurementModeThreshold>>(finalUrl, payload);
    return response.data;
  },
};
