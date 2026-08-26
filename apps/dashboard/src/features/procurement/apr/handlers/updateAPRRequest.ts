/**
 * Update APR Request Handler
 * Mutation blueprint for updating a draft APR via PUT /aprs/:aprId
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdateAPRCommandPayload } from '../types'

const endpoint = '/aprs/:aprId' as const

export const updateAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  UpdateAPRCommandPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('updateAPRRequest: Payload is required')
    }
    const response = await api.put<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
