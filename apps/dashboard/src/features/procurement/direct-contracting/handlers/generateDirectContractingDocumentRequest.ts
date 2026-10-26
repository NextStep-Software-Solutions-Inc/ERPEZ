import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/api/planning/documents/direct-contracting/:id/generate' as const

export type GenerateDirectContractingDocumentQueryParams = {
  format?: 'Excel' | 'Pdf'
}

export const generateDirectContractingDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  GenerateDirectContractingDocumentQueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}

export const generateAndDownloadDirectContractingDocument = generateDirectContractingDocumentRequest
