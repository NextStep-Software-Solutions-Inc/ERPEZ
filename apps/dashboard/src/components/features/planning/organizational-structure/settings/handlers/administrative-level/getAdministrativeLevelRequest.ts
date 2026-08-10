import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { AdministrativeLevel } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/administrative-levels/:id'

// NOTE: This handler returns a single AdministrativeLevel object as APIResponse<AdministrativeLevel>.
// All consumers (e.g., UpdateAdministrativeLevelDialog) must expect administrativeLevelData to be an object, not an array.
export const getAdministrativeLevelRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AdministrativeLevel>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AdministrativeLevel>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
