import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LIB } from '../types'

const endpoint = '/libs/:id/status'

export type UpdateLIBStatusPayload = {
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
}

export const updateLIBStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIB>,
  QueryParams,
  UpdateLIBStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<LIB>>(finalUrl, payload)
    return response.data
  },
}
