import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LIBAmendment, UpdateLIBAmendmentPayload } from '../../line-item-budget/types/type'

const endpoint = '/lib-amendment-requests/:id' as const

export const updateLIBAmendmentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBAmendment>,
  undefined,
  UpdateLIBAmendmentPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<LIBAmendment>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
