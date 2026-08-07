import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMPExpenditureItem } from '../types'

const endpoint = '/ppmp-expenditure-items'

export const getPPMPExpenditureItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PPMPExpenditureItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PPMPExpenditureItem>>(finalUrl, { signal })
    return response.data
  },
}
