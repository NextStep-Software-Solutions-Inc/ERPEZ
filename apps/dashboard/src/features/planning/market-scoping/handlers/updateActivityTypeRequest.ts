import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { ActivityTypeDefinition } from '../types/managementTypes'
import api from '@/services/api'

export interface UpdateActivityTypePayload {
  id: string
  type: string
  label: string
  description: string
  sortOrder: number
  isActive: boolean
}

const endpoint = '/v2/market-scoping/activity-types/:id'

export const updateActivityTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ActivityTypeDefinition>,
  undefined,
  UpdateActivityTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ActivityTypeDefinition>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
