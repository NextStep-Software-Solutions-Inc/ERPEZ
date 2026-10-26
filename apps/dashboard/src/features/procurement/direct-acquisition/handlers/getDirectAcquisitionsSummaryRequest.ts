import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

export interface DirectAcquisitionSummary {
  total: number
  draft: number
  purchaseEntry: number
  forDisbursement: number
  approved: number
  returned: number
}

const endpoint = '/direct-acquisitions/summary'

export const getDirectAcquisitionsSummaryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  DirectAcquisitionSummary
> = {
  endpoint,
  key: () => ['direct-acquisitions-summary'] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ succeeded: boolean; data: DirectAcquisitionSummary }>(finalUrl, { signal })
    return response.data?.data || {
      total: 0,
      draft: 0,
      purchaseEntry: 0,
      forDisbursement: 0,
      approved: 0,
      returned: 0,
    }
  },
}
