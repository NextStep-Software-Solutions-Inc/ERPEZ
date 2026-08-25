import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { SupplierApplicationResponse } from '../types'

export const getSupplierApplicationsRequest: QueryBlueprintFromTemplate<
  '/bac/projects/:projectId/applications',
  APIResponse<SupplierApplicationResponse[]>,
  QueryParams,
  QueryKey
> = {
  endpoint: '/bac/projects/:projectId/applications',
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<SupplierApplicationResponse[]>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
