import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { StepFormValues, StepSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/steps/:id'
type UpdateStepPayload = StepFormValues
export const updateStepRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<StepSetting>,
  undefined,
  UpdateStepPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<StepSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
