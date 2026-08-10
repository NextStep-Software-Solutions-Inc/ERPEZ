/**
 * Create Activity Type Request Handler
 * Mutation blueprint for creating a new market research activity type
 * Location: src/features/planning/market-scoping/handlers/
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { ActivityTypeDefinition } from '../types/managementTypes'
import api from '@/services/api'

export interface CreateActivityTypePayload {
  type: string
  label: string
  description: string
  sortOrder: number
  isActive: boolean
}

const endpoint = '/v2/market-scoping/activity-types'

export const createActivityTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ActivityTypeDefinition>,
  undefined,
  CreateActivityTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ActivityTypeDefinition>>(finalUrl, payload)
    return response.data
  },
}
