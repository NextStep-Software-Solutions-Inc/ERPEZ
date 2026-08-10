/**
 * Handler: Toggle Non-CSE Catalog Item status (mock)
 * Flips active ↔ inactive. Throws if item is locked.
 */

import { getMockNonCseItems } from '../utils/catalogMockData'
import type { NonCseCatalogItem } from '../types'

type HandlerParams = {
  itemId: string
}

export const toggleCatalogItemStatusRequest = {
  endpoint: '/catalog/master/items/:id/status',
  fetcher: async ({ itemId }: HandlerParams): Promise<NonCseCatalogItem> => {
    await new Promise((r) => setTimeout(r, 250))
    const items = getMockNonCseItems()
    const idx = items.findIndex((i) => i.id === itemId)
    if (idx === -1) throw new Error(`Item ${itemId} not found`)
    if (items[idx]!.isLocked)
      throw new Error('Cannot change status of a locked item.')

    const now = new Date().toISOString()
    const updated: NonCseCatalogItem = {
      ...items[idx]!,
      status: items[idx]!.status === 'active' ? 'inactive' : 'active',
      updatedAt: now,
      updatedBy: 'current_user',
    }
    items[idx] = updated
    return updated
  },
}
