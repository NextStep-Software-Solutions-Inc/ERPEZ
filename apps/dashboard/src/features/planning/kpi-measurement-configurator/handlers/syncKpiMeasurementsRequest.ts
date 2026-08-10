import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { KPIMeasurement, SyncKpiMeasurementsPayload } from '../types'

const endpoint = '/kpi-measurements'

export const syncKpiMeasurementsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPIMeasurement[]>,
  undefined,
  SyncKpiMeasurementsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<KPIMeasurement[]>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
