import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { OfficeCategoryEntity } from '@/components/features/planning/organizational-structure/types'
import type { APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/categories/:id'

// NOTE: This handler returns a single OfficeCategoryEntity object as APIResponse<OfficeCategoryEntity>.
// All consumers (e.g., UpdateOfficeCategoryDialog) must expect officeCategoryData to be an object, not an array.
export const getOfficeCategoryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeCategoryEntity>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OfficeCategoryEntity>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
