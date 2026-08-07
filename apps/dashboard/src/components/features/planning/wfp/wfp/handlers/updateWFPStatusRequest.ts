import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import { api } from '@/services/api'

const endpoint = '/wfps/:wfpId/status'

export type UpdateWFPStatusPayload = {
  status: 'Draft' | 'Submitted' | 'Returned' | 'Approved' | 'Active' | 'Archived' | 'Completed' | 'Failed' | 'Pending'
}

export const updateWFPStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<void>,
  undefined,
  UpdateWFPStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<void>>(finalUrl, payload)
    return response.data
  },
}
