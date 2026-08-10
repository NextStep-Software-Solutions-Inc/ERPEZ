import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { mapRatingScaleTemplateResponse } from '../mappers'
import type { RatingScaleTemplate, RatingScaleTemplateResponse } from '../types'

const endpoint = '/rating-scale-templates/:id'

export const getRatingScaleTemplateRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RatingScaleTemplate>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<RatingScaleTemplateResponse>>(
      finalUrl,
      { signal },
    )

    return {
      ...response.data,
      data: mapRatingScaleTemplateResponse(response.data.data),
    }
  },
}
