import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { KpiAssignment } from '../table/types'
import type { PaginationResponse, QueryParams } from 'erpez-shared-lib'
import { api } from '@/services/api'

const endpoint = '/du-kpi-assignments'

export const getDuKpiAssignmentsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<KpiAssignment>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<KpiAssignment>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
