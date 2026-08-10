import type { KpiTarget } from '../types';
import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import { api } from '@/services/api';

const endpoint = '/kpi-targets'

export interface CreateKpiTargetPayload {
  kpiId: string
  targetValue: number
  period?: string | null
  quarterName?: string | null
}

export const createKpiTargetRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KpiTarget>,
  undefined,
  CreateKpiTargetPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<KpiTarget>>(finalUrl, payload)
    return response.data
  },
}
