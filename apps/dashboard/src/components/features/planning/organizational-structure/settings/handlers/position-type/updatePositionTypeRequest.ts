import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { PositionTypeSetting, PositionTypeFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-types/:id'
type UpdatePositionTypePayload = PositionTypeFormValues
export const updatePositionTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PositionTypeSetting>,
  undefined,
  UpdatePositionTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PositionTypeSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
