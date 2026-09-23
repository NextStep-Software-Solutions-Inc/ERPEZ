import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id' as const

export interface UpdateDirectContractingPayload {
  name: string
  exclusiveSupplierId: string
  submissionDeadline: string
}

export const updateDirectContractingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<void>,
  undefined,
  UpdateDirectContractingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.put<APIResponse<void>>(finalUrl, payload)
    return response.data
  },
}
