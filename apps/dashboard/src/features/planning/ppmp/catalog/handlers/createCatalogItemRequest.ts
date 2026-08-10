/**
 * Handler: Create Non-CSE Catalog Item (mock)
 * Pushes a new item into the in-memory mock dataset.
 */

import { getMockNonCseItems } from '../utils/catalogMockData'
import type { NonCseCatalogItem, CreateCatalogItemPayload } from '../types'

type HandlerParams = {
  payload: CreateCatalogItemPayload
}

function generateItemCode(category: string, index: number): string {
  const prefix = category.replace(/\s+/g, '').toUpperCase().slice(0, 4)
  return `NC-${prefix}-${String(index).padStart(4, '0')}`
}

export const createCatalogItemRequest = {
  endpoint: '/catalog/master/items',
  fetcher: async ({ payload }: HandlerParams): Promise<NonCseCatalogItem> => {
    await new Promise((r) => setTimeout(r, 300))
    const items = getMockNonCseItems()
    const now = new Date().toISOString()
    const newItem: NonCseCatalogItem = {
      id: `nc-${String(items.length + 1).padStart(5, '0')}`,
      itemCode: generateItemCode(payload.category, items.length + 1),
      name: payload.name,
      description: payload.description ?? null,
      category: payload.category,
      subcategory: payload.subcategory ?? null,
      unitOfMeasure: payload.unitOfMeasure,
      currentPrice: payload.currentPrice,
      previousPrice: null,
      lastSurveyDate: now.slice(0, 10),
      tags: payload.tags ?? [],
      status: payload.status ?? 'active',
      isLocked: false,
      reasonLocked: null,
      referenceCount: 0,
      supplier: payload.supplier ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current_user',
      updatedBy: 'current_user',
    }
    items.push(newItem)
    return newItem
  },
}
