import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution, SubmitBacResolutionPayload } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects/:id/status'

export const submitBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  { id: string },
  SubmitBacResolutionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<BacResolution>(finalUrl, payload)
    return response.data
  },
}

