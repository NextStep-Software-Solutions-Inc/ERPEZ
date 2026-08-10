import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMPItemDetails } from '../types'

const endpoint = '/ppmp-items/:id'

export const getPPMPItemRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPItemDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PPMPItemDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
