import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMPItem } from '../types'

const endpoint = '/ppmp-items'

export const getPPMPItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PPMPItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PPMPItem>>(finalUrl, { signal })
    return response.data
  },
}
