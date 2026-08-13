import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { BACProject } from '../types'

const endpoint = '/bac/projects'

/**
 * Payload for creating a BAC project
 * Note: createdAt is system-generated on backend and should NOT be included
 */
export type CreateBACProjectPayload = {
  title?: string
  abc?: number
  sourceType: 'AppItem' | 'ConsolidatedPR'
  appItemId?: string
  consolidatedPRId?: string
  resolutionType?: string
  resolutionNumber?: string
  dateResolved: string
  resolvedLocation?: string
  selectedTemplateClauseIds?: string[]
  customClauses?: string[]
  endUserRepresentativeId?: string | null
  techRepresentativeId?: string | null
  userId: string
}

/**
 * Request handler for creating a BAC project
 * Handles mapping from frontend form to backend API
 */
export const createBACProject: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BACProject>,
  undefined,
  CreateBACProjectPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('BAC Project payload is required.')
    }

    const mappedSourceType = payload.sourceType === 'ConsolidatedPR' ? 1 : 0

    const apiPayload = {
      title: payload.title || undefined,
      abc: typeof payload.abc === 'number' ? payload.abc : undefined,
      sourceType: mappedSourceType,
      appItemId: mappedSourceType === 0 ? payload.appItemId : undefined,
      consolidatedPRId: mappedSourceType === 1 ? payload.consolidatedPRId : undefined,
      resolutionType: payload.resolutionType || 'Standard',
      resolutionNumber: payload.resolutionNumber || '',
      dateResolved: payload.dateResolved || new Date().toISOString(),
      resolvedLocation: payload.resolvedLocation || '',
      selectedTemplateClauseIds: payload.selectedTemplateClauseIds || [],
      customClauses: payload.customClauses || [],
      endUserRepresentativeId: payload.endUserRepresentativeId || null,
      techRepresentativeId: payload.techRepresentativeId || null,
      userId: payload.userId || '61a2206a-a15b-4512-8668-7d48f29b3fed',
    }

    const response = await api.post<APIResponse<BACProject>>(finalUrl, apiPayload)
    return response.data
  },
}
