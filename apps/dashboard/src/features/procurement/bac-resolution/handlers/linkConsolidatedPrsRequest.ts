import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution } from '../types'
import type { LinkConsolidatedPrsPayload } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects/:id/consolidated-pr'

export const linkConsolidatedPrsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  undefined,
  LinkConsolidatedPrsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<BacResolution>(finalUrl, payload)
    return response.data
  },
}
