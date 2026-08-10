import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ItemPrice } from '../types'

const endpoint = '/item-price/:id'

export const getItemPriceRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  ItemPrice,
  Record<string, never>,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<ItemPrice>(finalUrl, { signal })
    return response.data
  },
}
