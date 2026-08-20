import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { BacResolution } from '../types'
import { api } from '@/services/api'

const endpoint = '/bac-resolutions/:id'

export const getBacResolutionRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BacResolution>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<BacResolution>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
