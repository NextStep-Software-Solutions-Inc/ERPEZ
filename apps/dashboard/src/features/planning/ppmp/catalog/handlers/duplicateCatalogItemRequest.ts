/**
 * Handler: Duplicate Non-CSE Catalog Item (mock)
 * Creates a copy of an existing item with a new ID, itemCode, and "inactive" status.
 */

import { getMockNonCseItems } from '../utils/catalogMockData'
import type { NonCseCatalogItem } from '../types'

type HandlerParams = {
  itemId: string
}

export const duplicateCatalogItemRequest = {
  endpoint: '/catalog/master/items/:id/duplicate',
  fetcher: async ({ itemId }: HandlerParams): Promise<NonCseCatalogItem> => {
    await new Promise((r) => setTimeout(r, 350))
    const items = getMockNonCseItems()
    const source = items.find((i) => i.id === itemId)
    if (!source) throw new Error(`Item ${itemId} not found`)

    const now = new Date().toISOString()
    const newId = `nc-${String(items.length + 1).padStart(5, '0')}`
    const prefix = source.category.replace(/\s+/g, '').toUpperCase().slice(0, 4)
    const newCode = `NC-${prefix}-${String(items.length + 1).padStart(4, '0')}`

    const duplicate: NonCseCatalogItem = {
      ...source,
      id: newId,
      itemCode: newCode,
      name: `Copy of ${source.name}`,
      status: 'inactive',
      isLocked: false,
      reasonLocked: null,
      referenceCount: 0,
      previousPrice: null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current_user',
      updatedBy: 'current_user',
    }
    items.push(duplicate)
    return duplicate
  },
}
