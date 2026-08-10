import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { Office } from '../table/types'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/offices/:id'

export const getOfficeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Office>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Office>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
