import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { KpiAssignment } from '../table/types'
import { api } from '@/services/api'

const endpoint = '/kpi-assignments'

type CreateKpiAssignmentPayload = {
  fyActiveKPIId: string
  officeId: string
  assignedTargetAnnual: number
  assignedTargetQ1?: number
  assignedTargetQ2?: number
  assignedTargetQ3?: number
  assignedTargetQ4?: number
  isLocked?: boolean
}
export const createKpiAssignmentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KpiAssignment>,
  undefined,
  CreateKpiAssignmentPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<KpiAssignment>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
