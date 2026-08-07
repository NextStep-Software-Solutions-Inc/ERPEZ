import type { PaginationResponse, QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { Office } from '../table/types'

import api from '@/services/api'

const endpoint = '/offices'

export const getOfficesRequest: QueryBlueprintFromTemplate<
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
