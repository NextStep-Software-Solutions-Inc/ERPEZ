import type { QueryBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { EligibleAppForProcurement } from '../types'
import api from '@/services/api'

const endpoint = '/apps/eligible-for-procurement' as const

export const getEligibleAppsForProcurementRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EligibleAppForProcurement[]>
> = {
  endpoint,
  key: ({ url }) => ['eligible-apps-for-procurement', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<EligibleAppForProcurement[]>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
