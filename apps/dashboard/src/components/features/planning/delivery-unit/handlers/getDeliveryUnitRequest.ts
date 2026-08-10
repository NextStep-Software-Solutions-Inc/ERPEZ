import type { DeliveryUnit } from '../table/types'
import type { APIResponse, QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'

import api from '@/services/api'

const endpoint = '/delivery-units/:id'

export const getDeliveryUnitRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DeliveryUnit>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<DeliveryUnit>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
