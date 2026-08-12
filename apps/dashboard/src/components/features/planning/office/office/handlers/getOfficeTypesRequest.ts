import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import type { OfficeType } from '../table/types'
import api from '@/services/api'

const endpoint = '/office-types'

export const getOfficeTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<OfficeType>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<OfficeType>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
