import type { 
  APIResponse,
  MutationBlueprintFromTemplate
 } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ConsolidatedPR } from '../types/apiTypes'

const endpoint = '/consolidated-prs/:id/submit' as const

export const submitConsolidatedPrRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ConsolidatedPR>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<ConsolidatedPR>>(finalUrl, undefined)
    return response.data
  },
}
  