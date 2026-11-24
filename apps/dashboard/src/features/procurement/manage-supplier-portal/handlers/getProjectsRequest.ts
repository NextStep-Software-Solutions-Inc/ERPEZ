import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ProcurementProjectResponse } from '../types'

const endpoint = '/bac/projects'

export const getProjectsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementProjectResponse[]>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProcurementProjectResponse[]>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
