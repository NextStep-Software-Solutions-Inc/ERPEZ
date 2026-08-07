import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import api from '@/services/api'

const endpoint = '/general-rating-scales'

export type CreateGeneralRatingScalePayload = {
  fiscalYearId: string
  adjectivalRatingName: string
  minScore: number
  maxScore: number
}

export const createGeneralRatingScaleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<GeneralRatingScale>,
  undefined,
  CreateGeneralRatingScalePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<GeneralRatingScale>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
