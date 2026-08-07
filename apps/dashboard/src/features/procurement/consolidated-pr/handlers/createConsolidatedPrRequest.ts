import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateConsolidatedPrPayload } from '../types/apiTypes'

const endpoint = '/consolidated-prs' as const

export const createConsolidatedPrRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateConsolidatedPrPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}