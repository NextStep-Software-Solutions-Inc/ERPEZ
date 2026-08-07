import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { SatelliteClusterSetting, SatelliteClusterFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/clusters'

type CreateClusterPayload = SatelliteClusterFormValues

export const createClusterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SatelliteClusterSetting>,
  undefined,
  CreateClusterPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<SatelliteClusterSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
