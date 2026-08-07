import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import api from '@/services/api'

const endpoint = '/general-rating-scales/:id'

export type UpdateGeneralRatingScalePayload = {
  adjectivalRatingName?: string
  minScore?: number
  maxScore?: number
}

export const updateGeneralRatingScaleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<GeneralRatingScale>,
  undefined,
  UpdateGeneralRatingScalePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<GeneralRatingScale>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
