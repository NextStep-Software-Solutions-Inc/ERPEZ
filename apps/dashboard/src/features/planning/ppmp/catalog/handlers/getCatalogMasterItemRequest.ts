import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'
import api from '@/services/api'

const endpoint = '/non-cse-items/:id'

export const getCatalogMasterItemRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<NONCSEItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<NONCSEItem>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
