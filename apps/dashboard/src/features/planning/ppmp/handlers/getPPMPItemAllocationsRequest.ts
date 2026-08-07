import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMPItemAllocation } from '../types'

const endpoint = '/ppmp-item-allocations'

export const getPPMPItemAllocationsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PPMPItemAllocation>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PPMPItemAllocation>>(finalUrl, { signal })
    return response.data
  },
}
