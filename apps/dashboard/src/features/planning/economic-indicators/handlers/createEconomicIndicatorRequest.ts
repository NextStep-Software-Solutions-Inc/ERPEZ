import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type {
  CreateEconomicIndicatorPayload,
  EconomicIndicator,
} from '../components/table/data/economicIndicatorTypes'
import api from '@/services/api'

const endpoint = '/economic-indicators'

export const createEconomicIndicatorRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EconomicIndicator>,
  undefined,
  CreateEconomicIndicatorPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<EconomicIndicator>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
