import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint =
  '/api/planning/documents/opcr/consolidations/:consolidationId/generate' as const

export type GenerateConsolidatedOPCRDocumentQueryParams = {
  format?: 'Excel' | 'Pdf'
  ratingPeriod?: string
}

export const generateConsolidatedOPCRDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  GenerateConsolidatedOPCRDocumentQueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}
