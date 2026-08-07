import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateSupplierPayload, SupplierDetail } from '../types'

const endpoint = '/suppliers/with-requirements'

export const createSupplierRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SupplierDetail>,
  undefined,
  CreateSupplierPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<SupplierDetail>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
