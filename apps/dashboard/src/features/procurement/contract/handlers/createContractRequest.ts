/**
 * POST /contracts
 * Create a new Contract in Draft status linked to an approved NOA.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateContractRequest } from '../types'

const endpoint = '/contracts' as const

export const createContractRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateContractRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to create Contract.')
    }
    return response.data
  },
}
