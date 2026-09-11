/**
 * Update existing Market Scoping Form (Draft only)
 * Mutation handler for editing draft records
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { UpdateMarketScopingRequest as UpdatePayload } from '../types/marketScopingApiTypes'
import type { MarketScopingForm } from '../types/marketScopingTypes'
import api from '@/services/api'

const endpoint = '/market-scopings/:id' as const

export const updateMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<MarketScopingForm>,
  undefined,
  UpdatePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<MarketScopingForm>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
