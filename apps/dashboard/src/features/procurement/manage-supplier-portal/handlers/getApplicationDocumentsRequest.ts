import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { DocumentResponse } from '../types'

export const getApplicationDocumentsRequest: QueryBlueprintFromTemplate<
  '/procurement-projects/:projectId/applications/:applicationId/documents',
  APIResponse<DocumentResponse[]>,
  QueryParams,
  QueryKey
> = {
  endpoint: '/procurement-projects/:projectId/applications/:applicationId/documents',
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<DocumentResponse[]>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
