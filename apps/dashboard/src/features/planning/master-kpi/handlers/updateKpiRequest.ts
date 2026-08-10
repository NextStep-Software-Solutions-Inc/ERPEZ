import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdateKpiPayload } from '../utils/createKpiPayload'

export const updateKpiRequest: MutationBlueprintFromTemplate<
  '/kpis/:id',
  APIResponse<string>,
  undefined,
  UpdateKpiPayload
> = {
  endpoint: '/kpis/:id',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
