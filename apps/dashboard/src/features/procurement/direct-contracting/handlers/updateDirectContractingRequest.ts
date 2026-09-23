import type { APIResponse, MutationBlueprintFromTemplate, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'
import { DirectContracting } from '../types'

const endpoint = '/direct-contracting/:id' as const

export interface UpdateDirectContractingPayload {
  name: string
  exclusiveSupplierId: string
  submissionDeadline: string
}

export const updateDirectContractingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  DirectContracting,
  undefined,
  UpdateDirectContractingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<DirectContracting>(finalUrl, payload)
    return response.data
  },
}
