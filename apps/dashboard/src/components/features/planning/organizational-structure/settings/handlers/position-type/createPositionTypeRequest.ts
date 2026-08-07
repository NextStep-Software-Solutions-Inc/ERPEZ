import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { PositionTypeSetting, PositionTypeFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-types'

type CreatePositionTypePayload = PositionTypeFormValues

export const createPositionTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PositionTypeSetting>,
  undefined,
  CreatePositionTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PositionTypeSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
