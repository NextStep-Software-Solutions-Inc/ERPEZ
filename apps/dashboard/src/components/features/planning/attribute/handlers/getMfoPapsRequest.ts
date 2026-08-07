import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { MfoPap } from '../../mfopap/types'
import type { PaginationResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/mfopaps'

export const getMfoPapsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<MfoPap>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<MfoPap>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
