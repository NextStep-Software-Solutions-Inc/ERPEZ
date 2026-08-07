import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import {
  mapRatingScaleTemplateResponse,
  mapTemplateFormValuesToUpdatePayload,
} from '../mappers'
import type {
  RatingScaleTemplate,
  RatingScaleTemplateResponse,
  RatingScaleTemplateFormValues,
} from '../types'

const endpoint = '/rating-scale-templates/:id'

type UpdateRatingScaleTemplateFormValues = RatingScaleTemplateFormValues & {
  isDefault?: boolean
}

export const updateRatingScaleTemplateRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RatingScaleTemplate>,
  undefined,
  UpdateRatingScaleTemplateFormValues
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Rating scale template payload is required')
    }

    const response = await api.put<APIResponse<RatingScaleTemplateResponse>>(
      finalUrl,
      mapTemplateFormValuesToUpdatePayload(payload, payload.isDefault ?? false),
    )

    return {
      ...response.data,
      data: mapRatingScaleTemplateResponse(response.data.data),
    }
  },
}
