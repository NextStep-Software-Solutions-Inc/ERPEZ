/**
 * Handler: Get Budget Activities filtered by Line-Item Budget ID
 */

import { mockBudgetActivities } from '../data/mockPpmpData'
import type { BudgetActivity } from '../types'

export const getActivitiesRequest = {
  endpoint: '/budget/activities',
  key: ({ libId }: { libId: string }) => ['activities', libId] as const,
  fetcher: async (params: { data: { libId: string } }): Promise<BudgetActivity[]> => {
    await new Promise((r) => setTimeout(r, 300))
    return mockBudgetActivities.filter((a) => a.libId === params.data.libId)
  },
}
