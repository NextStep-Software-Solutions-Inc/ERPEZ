import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementModeThreshold } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-mode-thresholds';

export type CreateProcurementModeThresholdPayload = {
  procurementModeId: string;
  minThreshold: number;
  maxThreshold?: number;
  effectivityStart: Date;
  effectivityEnd?: Date;
};

export const createProcurementModeThresholdRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementModeThreshold>,
  undefined,
  CreateProcurementModeThresholdPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ProcurementModeThreshold>>(finalUrl, payload);
    return response.data;
  },
};
