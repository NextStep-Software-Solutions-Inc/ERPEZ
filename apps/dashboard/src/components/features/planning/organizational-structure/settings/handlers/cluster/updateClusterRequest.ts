import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { SatelliteClusterSetting, SatelliteClusterFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/clusters/:id'
type UpdateClusterPayload = SatelliteClusterFormValues
export const updateClusterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SatelliteClusterSetting>,
  undefined,
  UpdateClusterPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<SatelliteClusterSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
