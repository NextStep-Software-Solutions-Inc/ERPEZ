import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { ProcurementItem } from '../types/procurementItem.types'

const endpoint = '/procurement-items'

export const getProcurementItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ProcurementItem>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
