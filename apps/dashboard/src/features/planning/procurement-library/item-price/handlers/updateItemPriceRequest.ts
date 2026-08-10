import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ItemPrice, UpdateItemPricePayload } from '../types'

const endpoint = '/item-price/:id'

export const updateItemPriceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ItemPrice,
  undefined,
  UpdateItemPricePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<ItemPrice>(finalUrl, payload)
    return response.data
  },
}
