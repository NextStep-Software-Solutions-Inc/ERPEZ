import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LIBAmendmentDetails } from '../../line-item-budget/types/type'

const endpoint = '/lib-amendment-requests/:id' as const

export const getLIBAmendmentRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBAmendmentDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<LIBAmendmentDetails>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
