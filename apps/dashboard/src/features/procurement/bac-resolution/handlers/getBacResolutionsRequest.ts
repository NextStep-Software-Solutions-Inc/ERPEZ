import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolutionListItem } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects'

export const getBacResolutionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  BacResolutionListItem[]
> = {
  endpoint,
  key: ({ url }) => ['bac-resolutions', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<BacResolutionListItem[]>(finalUrl, {
      signal,
    })
    return response.data
  },
}

