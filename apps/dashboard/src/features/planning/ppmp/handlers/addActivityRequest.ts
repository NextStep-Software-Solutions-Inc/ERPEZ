/**
 * Handler: Add a new Activity block to a PPMP workspace.
 */

import { mockBudgetActivities, mockPpmpDatabase } from '../data/mockPpmpData'
import { assertPpmpWritable } from '../lib/ppmpUtils'
import type { PPMP, PPMPActivityBlock } from '../types'

interface AddActivityData {
  ppmpId: string
  activityId: string
}

export const addActivityRequest = {
  endpoint: '/ppmps/:id/activity-blocks',
  key: null,
  fetcher: async (params: { data: AddActivityData }): Promise<PPMP> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const ppmp = mockPpmpDatabase.find((item) => item.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    const activity = mockBudgetActivities.find(
      (item) => item.id === params.data.activityId,
    )
    if (!activity) throw new Error('Budget Activity not found.')

    if (ppmp.activityBlocks.some((block) => block.activityId === activity.id)) {
      throw new Error(
        `Activity "${activity.name}" is already added to this PPMP.`,
      )
    }

    const newActivityBlock: PPMPActivityBlock = {
      id: `ab-${Date.now()}`,
      activityId: activity.id,
      activityName: activity.name,
      activityCode: activity.code,
      ioEBlocks: [],
      totalCost: 0,
    }

    ppmp.activityBlocks.push(newActivityBlock)
    ppmp.updatedAt = new Date().toISOString()

    return { ...ppmp }
  },
}
