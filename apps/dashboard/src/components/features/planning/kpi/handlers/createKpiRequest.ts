import type { CreateKpiFormValues } from '../form/CreateKpiForm'
import type { APIResponse, MutationBlueprintFromTemplate, QueryParams } from 'erpez-shared-lib'
import type { KPI } from '../types'
import api from '@/services/api'

const endpoint = '/kpis'
type CreateKpiPayload = CreateKpiFormValues

export const createKpiRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPI>,
  QueryParams,
  CreateKpiPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<KPI>>(finalUrl, payload)
    return response.data
  },
}
