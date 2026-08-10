import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PositionTypeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-types/:id'

// NOTE: This handler returns a single PositionTypeSetting object as APIResponse<PositionTypeSetting>.
// All consumers must expect positionTypeData to be an object, not an array.
export const getPositionTypeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PositionTypeSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PositionTypeSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
