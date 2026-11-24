import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { BacProjectDetails } from '../types'
import { api } from '@/services/api'

const endpoint = '/bac/projects/:id'

export const getBacResolutionRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BacProjectDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<BacProjectDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
