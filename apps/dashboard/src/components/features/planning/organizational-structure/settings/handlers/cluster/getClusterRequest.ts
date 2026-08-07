import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { SatelliteClusterSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/clusters/:id'

// NOTE: This handler returns a single SatelliteClusterSetting object as APIResponse<SatelliteClusterSetting>.
// All consumers must expect clusterData to be an object, not an array.
export const getClusterRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SatelliteClusterSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<SatelliteClusterSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
