import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { ApproveBacResolutionPayload, BacResolution } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects/:id/approve'

export const approveBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  { id: string },
  ApproveBacResolutionPayload
> = {

  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<BacResolution>(finalUrl, payload)
    return response.data
  },
}
