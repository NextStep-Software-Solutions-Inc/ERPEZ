/**
 * Handler: Apply Bulk Price Adjustment (mock)
 * Adjusts currentPrice by a signed percentage for selected items or an entire category.
 */

import { getMockNonCseItems } from '../utils/catalogMockData'
import type {
  BulkAdjustmentPayload,
  AdjustmentPreview,
  AdjustmentPreviewItem,
} from '../types'

type HandlerParams = {
  payload: BulkAdjustmentPayload
}

export const applyBulkAdjustmentRequest = {
  endpoint: '/catalog/master/items/bulk-adjust',
  fetcher: async ({ payload }: HandlerParams): Promise<AdjustmentPreview> => {
    await new Promise((r) => setTimeout(r, 400))
    const items = getMockNonCseItems()
    const multiplier = 1 + payload.adjustmentPercent / 100
    const now = new Date().toISOString()

    const targets =
      payload.mode === 'selected'
        ? items.filter((i) => payload.itemIds?.includes(i.id))
        : items.filter(
            (i) => i.category === payload.category && i.status === 'active',
          )

    const previewItems: AdjustmentPreviewItem[] = []
    let totalDelta = 0

    for (const item of targets) {
      const idx = items.indexOf(item)
      const oldPrice = item.currentPrice
      const newPrice = Math.round(oldPrice * multiplier * 100) / 100
      const delta = newPrice - oldPrice
      totalDelta += delta

      items[idx] = {
        ...item,
        previousPrice: oldPrice,
        currentPrice: newPrice,
        lastSurveyDate: now.slice(0, 10),
        updatedAt: now,
        updatedBy: 'current_user',
      }

      previewItems.push({
        id: item.id,
        itemCode: item.itemCode,
        name: item.name,
        category: item.category,
        oldPrice,
        newPrice,
        delta,
      })
    }

    return {
      items: previewItems,
      totalAffected: previewItems.length,
      totalDelta: Math.round(totalDelta * 100) / 100,
    }
  },
}
