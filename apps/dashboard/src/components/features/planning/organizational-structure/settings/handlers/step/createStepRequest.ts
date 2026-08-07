import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { StepFormValues, StepSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/steps'

type CreateStepPayload = StepFormValues

export const createStepRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<StepSetting>,
  undefined,
  CreateStepPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<StepSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
