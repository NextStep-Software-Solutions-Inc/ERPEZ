/**
 * Handler: Delete Non-CSE Catalog Item (mock)
 * Removes item from the in-memory dataset.
 * Throws if item is locked.
 */

import { getMockNonCseItems } from '../utils/catalogMockData'

type HandlerParams = {
  itemId: string
}

export const deleteCatalogItemRequest = {
  endpoint: '/catalog/master/items/:id',
  fetcher: async ({ itemId }: HandlerParams): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300))
    const items = getMockNonCseItems()
    const idx = items.findIndex((i) => i.id === itemId)
    if (idx === -1) throw new Error(`Item ${itemId} not found`)
    if (items[idx]!.isLocked)
      throw new Error('Cannot delete a locked item. Deactivate it instead.')
    items.splice(idx, 1)
  },
}
