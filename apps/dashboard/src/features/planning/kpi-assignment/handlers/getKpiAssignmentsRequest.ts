import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { PaginationResponse, QueryParams } from 'erpez-shared-lib'
import { api } from '@/services/api'
import { KPIAssignment } from '../types'

const endpoint = '/kpi-assignments'

export const getKpiAssignmentsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<KPIAssignment>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<KPIAssignment>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
