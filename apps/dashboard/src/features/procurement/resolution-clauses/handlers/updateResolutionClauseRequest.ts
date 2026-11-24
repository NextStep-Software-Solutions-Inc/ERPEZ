import type { APIResponse, MutationBlueprintFromTemplate, QueryParams } from 'erpez-shared-lib'
import type { ResolutionClause, UpdateResolutionClausePayload } from '../types'
import { api } from '@/services/api'

const endpoint = '/resolution-clauses/:id'

export const updateResolutionClauseRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ResolutionClause,
  QueryParams,
  UpdateResolutionClausePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ResolutionClause>>(finalUrl, payload)
    return response.data.data
  },
}
