/**
 * Handler: Update Non-CSE Catalog Item (mock)
 * Finds item by ID and merges partial update payload.
 */

import { getMockNonCseItems } from '../utils/catalogMockData'
import type { NonCseCatalogItem, UpdateCatalogItemPayload } from '../types'

type HandlerParams = {
  itemId: string
  payload: UpdateCatalogItemPayload
}

export const updateCatalogItemRequest = {
  endpoint: '/catalog/master/items/:id',
  fetcher: async ({
    itemId,
    payload,
  }: HandlerParams): Promise<NonCseCatalogItem> => {
    await new Promise((r) => setTimeout(r, 300))
    const items = getMockNonCseItems()
    const idx = items.findIndex((i) => i.id === itemId)
    if (idx === -1) throw new Error(`Item ${itemId} not found`)

    const existing = items[idx]!
    const now = new Date().toISOString()
    const priceChanged =
      payload.currentPrice != null &&
      payload.currentPrice !== existing.currentPrice

    const updated: NonCseCatalogItem = {
      ...existing,
      ...(payload.name != null && { name: payload.name }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.category != null && { category: payload.category }),
      ...(payload.subcategory !== undefined && {
        subcategory: payload.subcategory,
      }),
      ...(payload.unitOfMeasure != null && {
        unitOfMeasure: payload.unitOfMeasure,
      }),
      ...(priceChanged && { previousPrice: existing.currentPrice }),
      ...(payload.currentPrice != null && {
        currentPrice: payload.currentPrice,
      }),
      ...(payload.supplier !== undefined && { supplier: payload.supplier }),
      ...(payload.tags !== undefined && { tags: payload.tags ?? [] }),
      ...(payload.status != null && { status: payload.status }),
      lastSurveyDate: priceChanged ? now.slice(0, 10) : existing.lastSurveyDate,
      updatedAt: now,
      updatedBy: 'current_user',
    }

    items[idx] = updated
    return updated
  },
}
