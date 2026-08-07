import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { KPIMeasurement } from '../types'

const endpoint = '/kpi-measurements/:id'

export const getKpiMeasurementRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPIMeasurement>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<KPIMeasurement>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
