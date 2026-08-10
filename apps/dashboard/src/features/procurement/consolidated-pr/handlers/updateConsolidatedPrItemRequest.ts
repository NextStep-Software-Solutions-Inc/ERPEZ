import type { MutationBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ConsolidatedPR, UpdateConsolidatedPrItemPayload } from '../types/apiTypes'

const endpoint = '/consolidated-prs/:id/items/:itemId' as const

export const updateConsolidatedPrItemRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ConsolidatedPR>,
  QueryParams,
  UpdateConsolidatedPrItemPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<ConsolidatedPR>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
