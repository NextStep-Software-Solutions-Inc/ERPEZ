import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { CreateResolutionClausePayload, ResolutionClause } from '../types'
import { api } from '@/services/api'

const endpoint = '/resolution-clauses'

export const createResolutionClauseRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ResolutionClause,
  undefined,
  CreateResolutionClausePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Resolution clause payload is required.')
    }

    const response = await api.post<APIResponse<ResolutionClause>>(finalUrl, payload)
    return response.data.data
  },
}
