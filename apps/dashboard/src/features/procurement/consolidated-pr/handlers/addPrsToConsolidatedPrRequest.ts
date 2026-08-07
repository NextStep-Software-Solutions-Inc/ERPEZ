import type { MutationBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'
import type { AddPrsToConsolidatedPrPayload, ConsolidatedPR } from '../types/apiTypes'

const endpoint = '/consolidated-prs/:id/prs' as const

export const addPrsToConsolidatedPrRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ConsolidatedPR>,
  QueryParams,
  AddPrsToConsolidatedPrPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ConsolidatedPR>>(
      finalUrl, 
      payload
    )
    return response.data
  },
}
