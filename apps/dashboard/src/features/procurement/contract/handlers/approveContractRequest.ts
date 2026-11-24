/**
 * POST /contracts/:id/approve
 * Approve a Contract under internal review with optional remarks.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ApproveContractRequest } from '../types'

const endpoint = '/contracts/:id/approve' as const

export const approveContractRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  ApproveContractRequest | undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl, payload ?? {})
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to approve Contract.')
    }
    return response.data
  },
}
