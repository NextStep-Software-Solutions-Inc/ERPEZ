/**
 * Handler: Get Items of Expenditure filtered by Activity ID
 */

import { mockItemsOfExpenditure } from '../data/mockPpmpData'
import type { ItemOfExpenditure } from '../types'

export const getIoEBlocksRequest = {
  endpoint: '/budget/ioe',
  key: ({ activityId }: { activityId: string }) =>
    ['ioe', activityId] as const,
  fetcher: async (params: {
    data: { activityId: string }
  }): Promise<ItemOfExpenditure[]> => {
    await new Promise((r) => setTimeout(r, 300))
    return mockItemsOfExpenditure.filter((i) => i.activityId === params.data.activityId)
  },
}
