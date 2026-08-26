import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/api/planning/documents/opcr/:opcrId/generate' as const

export type GenerateOPCRDocumentQueryParams = {
  format?: 'Excel' | 'Pdf'
}

export const generateOPCRDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  GenerateOPCRDocumentQueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}
