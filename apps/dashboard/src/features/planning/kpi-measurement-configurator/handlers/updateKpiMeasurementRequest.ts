import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { KPIMeasurement, UpdateKpiMeasurementPayload } from '../types'

const endpoint = '/kpi-measurements/:id'

export const updateKpiMeasurementRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPIMeasurement>,
  undefined,
  UpdateKpiMeasurementPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<KPIMeasurement>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
