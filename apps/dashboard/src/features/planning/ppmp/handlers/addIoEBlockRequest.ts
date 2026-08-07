/**
 * Handler: Add an Item of Expenditure block to an existing Activity block.
 */

import { assertPpmpWritable } from '../lib/ppmpUtils'
import {
  mockBudgetActivities,
  mockItemsOfExpenditure,
  mockPpmpDatabase,
} from '../data/mockPpmpData'
import type { PPMP, PPMPIoEBlock } from '../types'

interface AddIoEBlockData {
  ppmpId: string
  activityBlockId: string
  ioEId: string
  isProcurable: boolean
}

export const addIoEBlockRequest = {
  endpoint: '/ppmps/:id/ioe-blocks',
  key: null,
  fetcher: async (params: { data: AddIoEBlockData }): Promise<PPMP> => {
    await new Promise((resolve) => setTimeout(resolve, 350))

    const ppmp = mockPpmpDatabase.find((item) => item.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    const activityBlock = ppmp.activityBlocks.find(
      (block) => block.id === params.data.activityBlockId,
    )
    if (!activityBlock) throw new Error('Activity block not found.')

    const activity = mockBudgetActivities.find(
      (item) => item.id === activityBlock.activityId,
    )
    if (!activity) throw new Error('Budget Activity not found.')

    const ioe = mockItemsOfExpenditure.find(
      (item) => item.id === params.data.ioEId,
    )
    if (!ioe) throw new Error('Item of Expenditure not found.')

    if (activityBlock.ioEBlocks.some((block) => block.ioEId === ioe.id)) {
      throw new Error(`IoE "${ioe.name}" is already added to this activity.`)
    }

    const newIoEBlock: PPMPIoEBlock = {
      id: `ioeb-${Date.now()}`,
      ioEId: ioe.id,
      ioEName: ioe.name,
      ioECode: ioe.code,
      budgetLimit: ioe.budgetLimit,
      activityBlockId: activityBlock.id,
      items: [],
      totalCost: 0,
      isOverBudget: false,
      isProcurable: params.data.isProcurable,
    }

    activityBlock.ioEBlocks.push(newIoEBlock)
    ppmp.updatedAt = new Date().toISOString()

    return { ...ppmp }
  },
}
