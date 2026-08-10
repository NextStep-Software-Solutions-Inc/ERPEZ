import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
import type { Personnel } from '../table/types'
import api from '@/services/api'

const endpoint = '/personnel'

export const getPersonnelRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Personnel>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<Personnel>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
