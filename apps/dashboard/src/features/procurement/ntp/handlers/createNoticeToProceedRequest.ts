/**
 * POST /notice-to-proceed
 * Create a new Notice to Proceed in Draft status linked to an approved Contract.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateNoticeToProceedRequest } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed' as const

export const createNoticeToProceedRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateNoticeToProceedRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to create Notice to Proceed.')
    }
    return response.data
  },
}
