import type { QueryBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { EligibleConsolidatedPR } from '../types'
import api from '@/services/api'

const endpoint = '/consolidated-prs/eligible-for-procurement' as const

export const getEligibleConsolidatedPRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EligibleConsolidatedPR[]>
> = {
  endpoint,
  key: ({ url }) => ['eligible-consolidated-prs-for-procurement', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<EligibleConsolidatedPR[]>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
