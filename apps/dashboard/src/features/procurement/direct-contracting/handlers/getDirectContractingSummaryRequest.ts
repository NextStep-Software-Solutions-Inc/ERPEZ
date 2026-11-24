import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { DirectContractingSummary } from '../types'
import api from '@/services/api'

const endpoint = '/direct-contracting/summary'

export const getDirectContractingSummaryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  DirectContractingSummary
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ succeeded: boolean; data: DirectContractingSummary }>(finalUrl, { signal })
    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to fetch Direct Contracting summary.')
    }
    return response.data.data
  },
}
