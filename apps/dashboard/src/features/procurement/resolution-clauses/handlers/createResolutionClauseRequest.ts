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

    const response = await api.post<APIResponse<ResolutionClause | string>>(finalUrl, payload)
    const raw = response.data?.data
    if (raw && typeof raw === 'object' && 'id' in raw) {
      return raw as ResolutionClause
    }
    const resolvedId = typeof raw === 'string' ? raw : (response.data as any)?.id || ''
    return {
      id: resolvedId,
      name: payload.name,
      body: payload.body,
      clauseType: (payload.clauseType as any) || 'Whereas',
    }
  },
}
