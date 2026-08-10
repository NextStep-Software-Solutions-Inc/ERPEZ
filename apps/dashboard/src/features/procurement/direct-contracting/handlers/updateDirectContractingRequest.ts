import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem } from '../store/directContractingStore'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id'

export interface UpdateDirectContractingPayload {
  name: string
  exclusiveSupplierId: string
  submissionDeadline: string
}

export const updateDirectContractingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BackendDirectContractingItem,
  undefined,
  UpdateDirectContractingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.put<{ succeeded: boolean; data: BackendDirectContractingItem }>(finalUrl, payload)
    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to update Direct Contracting request.')
    }
    return response.data.data
  },
}
