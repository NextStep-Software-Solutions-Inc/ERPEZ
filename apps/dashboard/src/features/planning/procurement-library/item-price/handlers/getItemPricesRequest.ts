import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ItemPriceListItem, ItemPriceQueryParams } from '../types'

const endpoint = '/item-price'

export const getItemPricesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  Array<ItemPriceListItem>,
  ItemPriceQueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<Array<ItemPriceListItem>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
