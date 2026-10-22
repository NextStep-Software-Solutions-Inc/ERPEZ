/**
 * PUT /notice-to-proceed/{id}
 * Update a Draft Notice to Proceed.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdateNoticeToProceedRequest } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/:id' as const

export const updateNoticeToProceedRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  { id: string; payload: UpdateNoticeToProceedRequest }
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<string>>(finalUrl, payload.payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to update Notice to Proceed.')
    }
    return response.data
  },
}
