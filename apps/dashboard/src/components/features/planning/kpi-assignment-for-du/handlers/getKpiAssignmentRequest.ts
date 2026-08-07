import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { APIResponse, QueryParams } from 'erpez-shared-lib'
import { api } from '@/services/api'
import { KPIAssignmentDetails } from '@/features/planning/kpi-assignment'

const endpoint = '/kpi-assignments/:id'

export const getKpiAssignmentRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPIAssignmentDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<KPIAssignmentDetails>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
