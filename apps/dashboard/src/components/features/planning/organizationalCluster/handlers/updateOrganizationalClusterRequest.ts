import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { Cluster } from '../table/types'
import api from '@/services/api'

const endpoint = '/clusters/:id'

export type UpdateClusterPayload = {
  name?: string
  description?: string | null
}

export const updateClusterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Cluster>,
  undefined,
  UpdateClusterPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<Cluster>>(finalUrl, payload)
    return response.data
  },
}
