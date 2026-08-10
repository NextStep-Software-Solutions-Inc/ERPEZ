import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { PlantillaTypeSetting } from '@/components/features/planning/organizational-structure/types'
import type { APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/plantilla-types/:id'

export const getPlantillaTypeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PlantillaTypeSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PlantillaTypeSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
