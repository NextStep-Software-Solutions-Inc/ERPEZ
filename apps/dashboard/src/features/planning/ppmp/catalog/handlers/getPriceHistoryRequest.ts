/**
 * Handler: Get Price History for a catalog item (last 12 months)
 */

import { generatePriceHistory } from '../utils/catalogMockData'
import type { PriceHistoryEntry } from '../types'

type HandlerParams = {
  finalUrl: string
  itemId: string
  currentPrice: number
}

export const getPriceHistoryRequest = {
  endpoint: '/catalog/master/items/:id/price-history',
  key: ({ itemId }: { itemId: string }) =>
    ['catalog-price-history', itemId] as const,
  fetcher: async ({
    itemId,
    currentPrice,
  }: HandlerParams): Promise<PriceHistoryEntry[]> => {
    await new Promise((r) => setTimeout(r, 200))
    return generatePriceHistory(itemId, currentPrice)
  },
}
