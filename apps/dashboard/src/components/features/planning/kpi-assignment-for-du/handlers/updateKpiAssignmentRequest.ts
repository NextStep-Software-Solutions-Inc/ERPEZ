import type {
  MutationBlueprintFromTemplate,
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { KpiAssignment } from '../table/types'

const endpoint = '/kpi-assignments/:id'
export type UpdateKPIAssignmentPayload = {
  assignedTargetAnnual: number
  assignedTargetQ1?: number
  assignedTargetQ2?: number
  assignedTargetQ3?: number
  assignedTargetQ4?: number
  isLocked: boolean
}
export const updateKPIAssignmentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KpiAssignment>,
  QueryParams,
  UpdateKPIAssignmentPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<KpiAssignment>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
