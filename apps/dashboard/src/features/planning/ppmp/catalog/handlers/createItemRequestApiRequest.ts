import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

export interface CreateItemRequestPayload {
  officeId: string
  uomId?: string | null
  procurementCategoryId?: string | null
  name: string
  itemCategory: string
  status?: string
  estimatedUnitCost: number
  technicalSpecification?: string | null
  twgRemarks?: string | null
  uacsCode?: string | null
  unscpscCode?: string | null
}

const endpoint = '/item-requests'

export const createItemRequestApiRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateItemRequestPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
