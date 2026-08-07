import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import api from '@/services/api'

const endpoint = '/general-rating-scales/:id'

export const getGeneralRatingScaleRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<GeneralRatingScale>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<GeneralRatingScale>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
