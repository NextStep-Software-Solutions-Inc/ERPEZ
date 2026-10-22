import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import { DirectContracting } from '../types'

const endpoint = '/direct-contracting'

export type CreateDirectContractingPayload = {
  dcNumber: string
  name: string
  bacProjectId: string
  exclusiveSupplierId: string
  submissionDeadline: string
}

export const createDirectContractingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DirectContracting>,
  undefined,
  CreateDirectContractingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<DirectContracting>>(finalUrl, payload)
    return response.data
  },
}
