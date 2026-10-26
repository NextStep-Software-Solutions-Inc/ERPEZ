/**
 * PUT /contracts/:id
 * Update header details of a Draft or Returned Contract.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdateContractRequest } from '../types'

const endpoint = '/contracts/:id' as const

export const updateContractRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  UpdateContractRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<boolean>>(finalUrl, payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to update Contract.')
    }
    return response.data
  },
}
