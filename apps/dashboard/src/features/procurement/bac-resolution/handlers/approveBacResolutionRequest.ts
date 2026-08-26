import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { ApproveBacResolutionPayload, BacResolution } from '../types'
import api from '@/services/api'

const endpoint = '/bac-resolutions/:id/approve'

export const approveBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  undefined,
  ApproveBacResolutionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<BacResolution>(finalUrl, payload)
    return response.data
  },
}
