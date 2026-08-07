import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { mapRatingScaleTemplateResponses } from '../mappers'
import type { RatingScaleTemplate, RatingScaleTemplateResponse } from '../types'

const endpoint = '/rating-scale-templates'

export const getRatingScaleTemplatesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<RatingScaleTemplate>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<
      APIResponse<Array<RatingScaleTemplateResponse>>
    >(finalUrl, { signal })

    return {
      ...response.data,
      data: mapRatingScaleTemplateResponses(response.data.data),
    }
  },
}
