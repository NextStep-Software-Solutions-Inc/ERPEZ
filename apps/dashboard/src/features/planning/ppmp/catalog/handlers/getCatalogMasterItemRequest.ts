/**
 * Handler: Get a single Non-CSE Catalog Item by ID (full detail)
 */

import { getMockNonCseItems } from '../utils/catalogMockData'
import type { NonCseCatalogItem } from '../types'

type HandlerParams = {
  finalUrl: string
  itemId: string
}

export const getCatalogMasterItemRequest = {
  endpoint: '/catalog/master/items/:id',
  key: ({ itemId }: { itemId: string }) =>
    ['catalog-master-item', itemId] as const,
  fetcher: async ({ itemId }: HandlerParams): Promise<NonCseCatalogItem> => {
    await new Promise((r) => setTimeout(r, 250))

    const item = getMockNonCseItems().find((i) => i.id === itemId)
    if (!item) throw new Error(`Catalog item not found: ${itemId}`)

    return item
  },
}
