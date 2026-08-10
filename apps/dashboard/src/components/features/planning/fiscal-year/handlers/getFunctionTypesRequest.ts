import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/function-types'

export const getFunctionTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<{}>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<{}>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
