import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { KpiTarget } from '../types';
import { api } from '@/services/api';

const endpoint = '/kpi-targets/:id'

type UpdateKpiTargetPayload = KpiTarget

export const updateKpiTargetRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KpiTarget>,
  undefined,
  UpdateKpiTargetPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<KpiTarget>>(finalUrl, payload)
    return response.data
  },
}