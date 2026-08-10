/**
 * Handler: Update non-procurable costs for an IoE block.
 * Persists unsaved cost changes to the PPMP and recomputes block totals.
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP, NonProcurableCost } from '../types'
import {
  recomputeIoEBlock,
  recomputeActivityBlock,
  assertPpmpWritable,
} from '../lib/ppmpUtils'

interface UpdateNonProcurableCostsData {
  ppmpId: string
  blockId: string
  costs: NonProcurableCost[]
}

export const updateNonProcurableCostsRequest = {
  endpoint: '/ppmps/:ppmpId/blocks/:blockId/costs',
  key: null,
  fetcher: async (params: {
    data: UpdateNonProcurableCostsData
  }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 200))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    // Find the IoE block and update costs
    for (let ai = 0; ai < ppmp.activityBlocks.length; ai++) {
      const actBlock = ppmp.activityBlocks[ai]
      for (let bi = 0; bi < actBlock.ioEBlocks.length; bi++) {
        const ioEBlock = actBlock.ioEBlocks[bi]
        if (ioEBlock.id !== params.data.blockId) continue

        // Update costs
        ioEBlock.costs = params.data.costs

        // Cascade recompute up the tree
        ppmp.activityBlocks[ai].ioEBlocks[bi] = recomputeIoEBlock(ioEBlock)
        ppmp.activityBlocks[ai] = recomputeActivityBlock(
          ppmp.activityBlocks[ai],
        )
        ppmp.updatedAt = new Date().toISOString()

        return ppmp
      }
    }

    throw new Error(`IoE block ${params.data.blockId} not found.`)
  },
}
