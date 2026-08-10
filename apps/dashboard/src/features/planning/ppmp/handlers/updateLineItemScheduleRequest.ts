/**
 * Handler: Update the 12-month quantity schedule for a single line item.
 * Recomputes totalQuantity, estimatedBudget, and IoE block overflow status.
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP, MonthlyQuantities } from '../types'
import {
  recomputeLineItem,
  recomputeIoEBlock,
  recomputeActivityBlock,
  assertPpmpWritable,
} from '../lib/ppmpUtils'

interface UpdateScheduleData {
  ppmpId: string
  itemId: string
  monthlyQuantities: MonthlyQuantities
}

export const updateLineItemScheduleRequest = {
  endpoint: '/ppmps/:ppmpId/items/:itemId/schedule',
  key: null,
  fetcher: async (params: { data: UpdateScheduleData }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 200))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    for (let ai = 0; ai < ppmp.activityBlocks.length; ai++) {
      const actBlock = ppmp.activityBlocks[ai]
      for (let bi = 0; bi < actBlock.ioEBlocks.length; bi++) {
        const ioEBlock = actBlock.ioEBlocks[bi]
        const itemIdx = ioEBlock.items.findIndex((i) => i.id === params.data.itemId)
        if (itemIdx === -1) continue

        // Update quantities and recompute derived fields
        const updatedItem = recomputeLineItem({
          ...ioEBlock.items[itemIdx],
          monthlyQuantities: params.data.monthlyQuantities,
        })
        ioEBlock.items[itemIdx] = updatedItem

        // Cascade recompute up the tree
        ppmp.activityBlocks[ai].ioEBlocks[bi] = recomputeIoEBlock(ioEBlock)
        ppmp.activityBlocks[ai] = recomputeActivityBlock(ppmp.activityBlocks[ai])
        ppmp.totalBudget = ppmp.activityBlocks.reduce((acc, a) => acc + a.totalCost, 0)
        ppmp.updatedAt = new Date().toISOString()

        return { ...ppmp }
      }
    }

    throw new Error(`Line item "${params.data.itemId}" not found.`)
  },
}
