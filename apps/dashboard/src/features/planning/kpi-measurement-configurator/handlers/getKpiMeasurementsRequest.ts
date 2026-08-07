import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { KPIMeasurement } from '../types'

const endpoint = '/kpi-measurements'

export const getKpiMeasurementsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<KPIMeasurement>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<KPIMeasurement>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
