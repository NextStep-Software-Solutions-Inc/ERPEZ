import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem } from '../store/directContractingStore'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id/status'

export interface ChangeDirectContractingStatusPayload {
  status: string
}

export const changeDirectContractingStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BackendDirectContractingItem,
  undefined,
  ChangeDirectContractingStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.patch<{ succeeded: boolean; data: BackendDirectContractingItem }>(finalUrl, payload)
    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to change status.')
    }
    return response.data.data
  },
}
