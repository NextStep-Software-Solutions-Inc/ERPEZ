/**
 * Handler: Delete a line item from its IoE block
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP } from '../types'
import {
  recomputeIoEBlock,
  recomputeActivityBlock,
  assertPpmpWritable,
} from '../lib/ppmpUtils'

export const deleteLineItemRequest = {
  endpoint: '/ppmps/:ppmpId/items/:itemId',
  key: null,
  fetcher: async (params: { data: { ppmpId: string; itemId: string } }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 250))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    for (let ai = 0; ai < ppmp.activityBlocks.length; ai++) {
      const actBlock = ppmp.activityBlocks[ai]
      for (let bi = 0; bi < actBlock.ioEBlocks.length; bi++) {
        const ioEBlock = actBlock.ioEBlocks[bi]
        const originalLength = ioEBlock.items.length
        ioEBlock.items = ioEBlock.items.filter((i) => i.id !== params.data.itemId)
        if (ioEBlock.items.length < originalLength) {
          ppmp.activityBlocks[ai].ioEBlocks[bi] = recomputeIoEBlock(ioEBlock)
          ppmp.activityBlocks[ai] = recomputeActivityBlock(ppmp.activityBlocks[ai])
          ppmp.totalBudget = ppmp.activityBlocks.reduce((acc, a) => acc + a.totalCost, 0)
          ppmp.updatedAt = new Date().toISOString()
          return { ...ppmp }
        }
      }
    }

    throw new Error(`Line item "${params.data.itemId}" not found.`)
  },
}
