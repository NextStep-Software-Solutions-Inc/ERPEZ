/**
 * POST /notice-to-proceed/:id/generate-document
 * Generate and persist official Notice to Proceed PDF document archive
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/notice-to-proceed/:id/generate-document' as const

export const generateNoticeToProceedDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to generate Notice to Proceed document.')
    }
    return response.data
  },
}
