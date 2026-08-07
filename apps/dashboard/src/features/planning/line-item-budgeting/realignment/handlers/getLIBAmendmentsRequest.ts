import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LIBAmendment } from '../../line-item-budget/types/type'

const endpoint = '/lib-amendment-requests' as const

export const getLIBAmendmentsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<LIBAmendment>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<LIBAmendment>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
