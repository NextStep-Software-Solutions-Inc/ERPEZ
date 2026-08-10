import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { AllocationMonth, PPMPItemAllocation } from '../types'

const endpoint = '/ppmp-item-allocations'

export type CreatePPMPItemAllocationPayload = {
  ppmpItemId: string
  allocationMonth: AllocationMonth
  quantity: number
}

export const createPPMPItemAllocationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPItemAllocation>,
  undefined,
  CreatePPMPItemAllocationPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PPMPItemAllocation>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
