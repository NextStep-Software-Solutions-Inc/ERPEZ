import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import {
  mapRatingScaleTemplateResponse,
  mapTemplateFormValuesToCreatePayload,
} from '../mappers'
import type {
  RatingScaleTemplate,
  RatingScaleTemplateResponse,
  RatingScaleTemplateFormValues,
} from '../types'

const endpoint = '/rating-scale-templates'

export const createRatingScaleTemplateRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RatingScaleTemplate>,
  undefined,
  RatingScaleTemplateFormValues
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Rating scale template payload is required')
    }
    const response = await api.post<APIResponse<RatingScaleTemplateResponse>>(
      finalUrl,
      mapTemplateFormValuesToCreatePayload(payload),
    )

    return {
      ...response.data,
      data: mapRatingScaleTemplateResponse(response.data.data),
    }
  },
}
