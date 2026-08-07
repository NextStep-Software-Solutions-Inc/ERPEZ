import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/api/planning/documents/lib/:libId/generate' as const

export type GenerateLIBDocumentQueryParams = {
  format?: 'Excel' | 'Pdf'
}

export const generateLIBDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  GenerateLIBDocumentQueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}
