import type { 
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ConsolidatedPR } from '../types/apiTypes'

const endpoint = '/consolidated-prs/:id/return' as const

export type ReturnConsolidatedPrPayload = {
  remarks: string
}

export const returnConsolidatedPrRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ConsolidatedPR>,
  QueryParams,
  ReturnConsolidatedPrPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ConsolidatedPR>>(finalUrl, payload)
    return response.data
  },
}
