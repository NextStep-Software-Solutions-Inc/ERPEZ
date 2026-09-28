import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem, DirectContractingStatusEnum } from '../types'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id/status'

export interface ChangeDirectContractingStatusPayload {
  status: DirectContractingStatusEnum | string
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
    const response = await api.patch<{
      succeeded: boolean
      message?: string
      data: BackendDirectContractingItem
    }>(finalUrl, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to change status.')
    }
    return response.data.data
  },
}
