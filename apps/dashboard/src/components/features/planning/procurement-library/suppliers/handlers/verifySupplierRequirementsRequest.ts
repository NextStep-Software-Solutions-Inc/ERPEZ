import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { VerifySupplierRequirementsPayload } from '../types'

const endpoint = '/suppliers/:id/requirements'

export const verifySupplierRequirementsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<unknown>,
  undefined,
  VerifySupplierRequirementsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<unknown>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
