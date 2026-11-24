/**
 * POST /contracts/:id/return
 * Return a Contract under review for revision with mandatory remarks.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ReturnContractRequest } from '../types'

const endpoint = '/contracts/:id/return' as const

export const returnContractRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  ReturnContractRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl, payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to return Contract.')
    }
    return response.data
  },
}
