import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

export interface UpdateItemRequestPayload {
  name?: string
  itemCategory?: string
  status?: string
  estimatedUnitCost?: number
  uomId?: string | null
  procurementCategoryId?: string | null
  technicalSpecification?: string | null
  twgRemarks?: string | null
  uacsCode?: string | null
  unscpscCode?: string | null
}

const endpoint = '/item-requests/:id'

export const updateItemRequestApiRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  { id: string },
  UpdateItemRequestPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
