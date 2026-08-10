import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { OPCR } from '../types'

const endpoint = '/opcrs'

export const getOPCRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OPCR>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OPCR>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
