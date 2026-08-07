import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { DUAllocation } from '../table/types'
import api from '@/services/api'

// API endpoint for delivery unit allocations
const endpoint = '/du-allocations'

// Payload for creating a delivery unit allocation
export type CreateDUAllocationPayload = {
  deliveryUnitId: string
  purpose: string
  amount: number
  duFundAllocations: Array<{
    receivedFundId: string
    amount: number
  }>
}

export const createDUAllocationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DUAllocation>,
  undefined,
  CreateDUAllocationPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<DUAllocation>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
