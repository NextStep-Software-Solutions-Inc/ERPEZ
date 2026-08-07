import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { Cluster } from '../table/types'
import api from '@/services/api'

// API endpoint for clusters
const endpoint = '/clusters'

// Payload for creating a cluster
export type CreateClusterPayload = {
  name: string
  description?: string | null
}

export const createOrganizationalClusterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Cluster>,
  undefined,
  CreateClusterPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<Cluster>>(finalUrl, payload)
    return response.data
  },
}
