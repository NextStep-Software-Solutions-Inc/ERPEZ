import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LIBDashboardSummary } from '../types'

const endpoint = '/libs/:id/summary'

export const getLIBSummaryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBDashboardSummary>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<LIBDashboardSummary>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
