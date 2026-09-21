/**
 * POST /contracts/:id/generate-document
 * Generate and persist official Contract Agreement PDF document
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/contracts/:id/generate-document' as const

export const generateContractDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to generate Contract document.')
    }
    return response.data
  },
}