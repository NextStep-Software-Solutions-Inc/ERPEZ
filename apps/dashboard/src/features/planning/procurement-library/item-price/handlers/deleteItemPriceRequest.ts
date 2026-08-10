import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ItemPrice } from '../types'

const endpoint = '/item-price/:id'

export const deleteItemPriceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ItemPrice
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<ItemPrice>(finalUrl)
    return response.data
  },
}
