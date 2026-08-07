import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem } from '../store/directContractingStore'
import api from '@/services/api'

const endpoint = '/direct-contracting'

export interface CreateDirectContractingPayload {
  dcNumber: string
  name: string
  bacProjectId: string
  exclusiveSupplierId: string
  submissionDeadline: string
}

export const createDirectContractingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BackendDirectContractingItem,
  undefined,
  CreateDirectContractingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.post<{ succeeded: boolean; data: BackendDirectContractingItem }>(finalUrl, payload)
    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to create Direct Contracting request.')
    }
    return response.data.data
  },
}
