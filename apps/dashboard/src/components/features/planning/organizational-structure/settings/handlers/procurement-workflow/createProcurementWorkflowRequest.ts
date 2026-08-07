import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { ProcurementWorkflowSetting, ProcurementWorkflowFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'
  
const endpoint = '/procurement-workflows'

type CreateProcurementWorkflowPayload = ProcurementWorkflowFormValues

export const createProcurementWorkflowRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementWorkflowSetting>,
  undefined,
  CreateProcurementWorkflowPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ProcurementWorkflowSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
