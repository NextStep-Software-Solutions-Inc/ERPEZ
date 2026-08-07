import type { DeliveryUnit } from '../table/types'
import type { PaginationResponse, QueryBlueprintFromTemplate,
  QueryKey, QueryParams  } from 'erpez-shared-lib'

import api from '@/services/api'


const endpoint = '/delivery-units'

export const getDeliveryUnitsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<DeliveryUnit>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<DeliveryUnit>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
