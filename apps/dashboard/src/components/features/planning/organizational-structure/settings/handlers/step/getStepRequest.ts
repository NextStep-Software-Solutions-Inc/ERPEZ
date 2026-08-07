import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { StepSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/steps/:id'

// NOTE: This handler returns a single StepSetting object as APIResponse<StepSetting>.
// All consumers (e.g., UpdateStepDialog) must expect stepData to be an object, not an array.
export const getStepRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<StepSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<StepSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
