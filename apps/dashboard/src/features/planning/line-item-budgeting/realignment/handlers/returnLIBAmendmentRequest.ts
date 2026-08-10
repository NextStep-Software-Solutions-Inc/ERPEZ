import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LIBAmendment } from '../../line-item-budget/types/type'

const endpoint = '/lib-amendment-requests/:id/return'

export const returnLIBAmendmentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBAmendment>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<LIBAmendment>>(
      finalUrl,
      undefined,
    )
    return response.data
  },
}
