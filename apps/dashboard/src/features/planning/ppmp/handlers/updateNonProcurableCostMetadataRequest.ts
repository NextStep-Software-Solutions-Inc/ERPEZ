/**
 * Handler: Update non-procurable cost metadata
 * Updates specific metadata fields (projectType, sizeSpecification, procurement info, etc.)
 * for a single non-procurable cost item
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP, NonProcurableCost } from '../types'
import {
  recomputeIoEBlock,
  recomputeActivityBlock,
  assertPpmpWritable,
} from '../lib/ppmpUtils'

interface UpdateNonProcurableCostMetadataData {
  ppmpId: string
  blockId: string
  costId: string
  metadata: Partial<NonProcurableCost>
}

export const updateNonProcurableCostMetadataRequest = {
  endpoint: '/ppmps/:ppmpId/blocks/:blockId/costs/:costId/metadata',
  key: null,
  fetcher: async (params: {
    data: UpdateNonProcurableCostMetadataData
  }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 300))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    // Find the IoE block and the specific cost
    for (let ai = 0; ai < ppmp.activityBlocks.length; ai++) {
      const actBlock = ppmp.activityBlocks[ai]
      for (let bi = 0; bi < actBlock.ioEBlocks.length; bi++) {
        const ioEBlock = actBlock.ioEBlocks[bi]
        if (ioEBlock.id !== params.data.blockId) continue

        // Find and update the specific cost
        const costIndex = ioEBlock.costs.findIndex(
          (c) => c.id === params.data.costId,
        )
        if (costIndex < 0) {
          throw new Error(
            `Non-procurable cost ${params.data.costId} not found.`,
          )
        }

        // Merge metadata updates with existing cost
        ioEBlock.costs[costIndex] = {
          ...ioEBlock.costs[costIndex],
          ...params.data.metadata,
        }

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
