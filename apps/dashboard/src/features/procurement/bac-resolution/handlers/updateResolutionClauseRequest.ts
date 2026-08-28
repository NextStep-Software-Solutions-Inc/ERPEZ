import type { APIResponse, MutationBlueprintFromTemplate, QueryParams } from 'erpez-shared-lib'
import type { ResolutionClause, ResolutionClauseType } from '../types'
import { api } from '@/services/api'

const endpoint = '/resolution-clauses/:id'

export type UpdateResolutionClausePayload = {
  name?: string
  body?: string
  clauseType?: ResolutionClauseType | string
}

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
