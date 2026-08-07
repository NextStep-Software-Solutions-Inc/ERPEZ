import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { PPMPAllocationMonth, PPMPItemAllocation } from '../types'

const endpoint = '/ppmp-item-allocations/:id'

export type UpdatePPMPItemAllocationPayload = {
  allocationMonth?: PPMPAllocationMonth
  quantity?: number
}

export const updatePPMPItemAllocationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPItemAllocation>,
  QueryParams,
  UpdatePPMPItemAllocationPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PPMPItemAllocation>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
