import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { DUAllocation } from '../table/types'
import api from '@/services/api'

const endpoint = '/du-allocations/:id'

export type UpdateDUAllocationPayload = {
  purpose?: string
  amount?: number
  duFundAllocations?: Array<{
    receivedFundId: string
    amount: number
  }>
}

export const updateDUAllocationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DUAllocation>,
  undefined,
  UpdateDUAllocationPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<DUAllocation>>(finalUrl, payload)
    return response.data
  },
}
