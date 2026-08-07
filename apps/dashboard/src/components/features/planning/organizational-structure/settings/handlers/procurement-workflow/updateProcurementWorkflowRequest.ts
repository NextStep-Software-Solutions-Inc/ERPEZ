import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { ProcurementWorkflowSetting, ProcurementWorkflowFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/procurement-workflows/:id'
type UpdateProcurementWorkflowPayload = ProcurementWorkflowFormValues
export const updateProcurementWorkflowRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementWorkflowSetting>,
  undefined,
  UpdateProcurementWorkflowPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ProcurementWorkflowSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
