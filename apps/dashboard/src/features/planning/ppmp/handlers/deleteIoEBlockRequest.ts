/**
 * Handler: Delete an IoE block from an Activity block.
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import { assertPpmpWritable, recomputeActivityBlock } from '../lib/ppmpUtils'
import type { PPMP } from '../types'

export const deleteIoEBlockRequest = {
  endpoint: '/ppmps/:ppmpId/activities/:activityId/blocks/:blockId',
  key: null,
  fetcher: async (params: {
    data: { ppmpId: string; blockId: string }
  }): Promise<PPMP> => {
    await new Promise((resolve) => setTimeout(resolve, 250))

    const ppmp = mockPpmpDatabase.find((item) => item.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    for (let ai = 0; ai < ppmp.activityBlocks.length; ai++) {
      const activity = ppmp.activityBlocks[ai]
      const originalLength = activity.ioEBlocks.length
      activity.ioEBlocks = activity.ioEBlocks.filter(
        (block) => block.id !== params.data.blockId,
      )

      if (activity.ioEBlocks.length === originalLength) {
        continue
      }

      ppmp.activityBlocks[ai] = recomputeActivityBlock(activity)
      ppmp.totalBudget = ppmp.activityBlocks.reduce(
        (total, currentActivity) => total + currentActivity.totalCost,
        0,
      )
      ppmp.updatedAt = new Date().toISOString()

      return { ...ppmp }
    }

    throw new Error(`IoE block "${params.data.blockId}" not found.`)
  },
}
