import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateKpiPayload } from '../types'

export const createKpiRequest: MutationBlueprintFromTemplate<
  '/kpis',
  APIResponse<string>,
  undefined,
  CreateKpiPayload
> = {
  endpoint: '/kpis',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
