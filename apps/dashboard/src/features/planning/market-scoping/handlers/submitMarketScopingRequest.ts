/**
 * Submit Market Scoping Handler
 * POST /market-scopings/:id/submit
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { MarketScopingForm } from '../types/marketScopingTypes'

const endpoint = '/market-scopings/:id/submit' as const

export interface SubmitForApprovalPayload {
  submissionComments?: string
}

export const submitMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<MarketScopingForm>,
  undefined,
  SubmitForApprovalPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<MarketScopingForm>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
