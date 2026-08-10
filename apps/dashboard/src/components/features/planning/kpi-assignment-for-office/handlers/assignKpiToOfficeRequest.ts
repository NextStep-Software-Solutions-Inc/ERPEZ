import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import { api } from '@/services/api'
import type { KPIAssignment } from '@/features/planning/kpi-assignment/types'
import type { CreateKpiAssignmentPayload } from '../types/assignKpiSchema'

const endpoint = '/kpi-assignments'

/**
 * Mutation blueprint for assigning a KPI to an office
 * Creates a new KPI assignment record with annual and optional quarterly targets
 */
export const assignKpiToOfficeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPIAssignment>,
  undefined,
  CreateKpiAssignmentPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<KPIAssignment>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
