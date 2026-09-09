import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { ProcurementActivityType } from '../types/procurementActivityTypes'
import api from '@/services/api'
import { PaginatedResponse } from '../shared'

const endpoint = '/procurement-activity-types'

export const getProcurementActivityTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginatedResponse<ProcurementActivityType>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginatedResponse<ProcurementActivityType>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
