import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { OPCRItem } from '../types'

const endpoint = '/opcr-items'

export const getOPCRItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OPCRItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OPCRItem>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
