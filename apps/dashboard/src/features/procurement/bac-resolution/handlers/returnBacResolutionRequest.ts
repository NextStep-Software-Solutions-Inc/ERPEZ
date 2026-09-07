import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution, ReturnBacResolutionPayload } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects/:id/return'

export const returnBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  { id: string },
  ReturnBacResolutionPayload
> = {

  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<BacResolution>(finalUrl, payload)
    return response.data
  },
}
