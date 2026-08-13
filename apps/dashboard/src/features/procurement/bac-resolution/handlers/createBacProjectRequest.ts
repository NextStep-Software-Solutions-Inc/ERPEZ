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
    const response = await api.post<APIResponse<BACProject>>(finalUrl, payload)
    return response.data
  },
}
