import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type {
  UpdateEconomicIndicatorPayload,
  EconomicIndicator,
} from '../components/table/data/economicIndicatorTypes'
import api from '@/services/api'

const endpoint = '/economic-indicators/:id'

export const updateEconomicIndicatorRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EconomicIndicator>,
  undefined,
  UpdateEconomicIndicatorPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<EconomicIndicator>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
