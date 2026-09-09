import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type {
  ProcurementActivityType
} from '../types/procurementActivityTypes'
import api from '@/services/api'

const endpoint = '/procurement-activity-types'

export const getProcurementActivityTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementActivityType>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ProcurementActivityType>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
