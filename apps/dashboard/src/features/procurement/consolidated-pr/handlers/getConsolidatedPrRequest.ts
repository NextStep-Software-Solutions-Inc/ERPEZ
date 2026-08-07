import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ConsolidatedPrDetail } from '../types/apiTypes'

const endpoint = '/consolidated-prs/:id' as const

export const getConsolidatedPrRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ConsolidatedPrDetail>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ConsolidatedPrDetail>>(
      finalUrl, 
      { signal },
    )
    return response.data
  },
}
