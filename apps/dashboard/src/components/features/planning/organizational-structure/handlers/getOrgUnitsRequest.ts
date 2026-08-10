import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { Office } from '../../office'

const endpoint = '/offices'

export const getOrgUnitsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Office>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<Office>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
