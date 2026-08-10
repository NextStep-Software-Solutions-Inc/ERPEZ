import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LIBAmendment, CreateLIBAmendmentPayload } from '../../line-item-budget/types/type'

const endpoint = '/lib-amendment-requests' as const

export const createLIBAmendmentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBAmendment>,
  undefined,
  CreateLIBAmendmentPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<LIBAmendment>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
