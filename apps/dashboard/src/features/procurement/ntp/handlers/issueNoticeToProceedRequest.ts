/**
 * POST /notice-to-proceed/{id}/issue
 * Issue an NTP, freezing contractual snapshots.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { IssueNoticeToProceedRequest } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/:id/issue' as const

export const issueNoticeToProceedRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  { id: string; payload: IssueNoticeToProceedRequest }
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload.payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to issue Notice to Proceed.')
    }
    return response.data
  },
}
