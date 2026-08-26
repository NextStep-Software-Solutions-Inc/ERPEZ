import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
const endpoint = '/api/planning/documents/bac-resolution/:bacResolutionId/generate' as const
export type GenerateBacResolutionDocumentQueryParams = {
  format?: 'Excel' | 'Pdf'
}
export const generateBacResolutionDocumentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  GenerateBacResolutionDocumentQueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}