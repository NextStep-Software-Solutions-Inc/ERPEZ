import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateItemPricePayload, ItemPrice } from '../types'

const endpoint = '/item-price'

export const createItemPriceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ItemPrice,
  undefined,
  CreateItemPricePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<ItemPrice>(finalUrl, payload)
    return response.data
  },
}
