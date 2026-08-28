import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { RatingScaleTemplateResponse } from '@/features/planning/rating-scale-template/types'
import { api } from '@/services/api'

const endpoint = '/rating-scale-templates/:id'

export const getRatingScaleTemplateRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RatingScaleTemplateResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<RatingScaleTemplateResponse>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
