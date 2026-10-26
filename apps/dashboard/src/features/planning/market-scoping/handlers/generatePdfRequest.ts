/**
 * Generate Market Scoping PDF
 * Mutation handler - generates NGPA-compliant PDF document
 * Only accessible when status is "Approved"
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/api/planning/documents/market-scoping/:id/generate' as const

export const generatePdfRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}
