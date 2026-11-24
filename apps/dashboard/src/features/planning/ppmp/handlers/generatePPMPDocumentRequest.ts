import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/api/planning/documents/ppmp/:ppmpId/generate' as const

export type GeneratePPMPDocumentQueryParams = {
  format?: 'Excel' | 'Pdf'
}

export const generatePPMPDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  GeneratePPMPDocumentQueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}
