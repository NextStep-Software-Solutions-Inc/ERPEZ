import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/api/planning/lib-realignments/:id/generate' as const

export type GenerateLibRealignmentPdfQueryParams = {
  format?: 'Pdf'
}

export const generateLibRealignmentPdfRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  GenerateLibRealignmentPdfQueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}
