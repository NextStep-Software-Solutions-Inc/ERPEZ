import type { QueryBlueprintFromTemplate, APIResponse, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PositionCategorySetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-categories/:id'

export const getPositionCategoryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PositionCategorySetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PositionCategorySetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
