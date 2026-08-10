import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { OPCRListItem } from '../types'

const endpoint = '/opcrs'

export const getOPCRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OPCRListItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OPCRListItem>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
