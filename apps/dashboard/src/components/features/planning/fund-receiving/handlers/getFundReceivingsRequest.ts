import type { PaginationResponse, QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { FundReceiving } from '../table/types'

import api from '@/services/api'

const endpoint = '/received-funds'

export const getFundReceivingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FundReceiving>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<FundReceiving>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
