import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import type { OPCR } from '../types/type.opcr'
import api from '@/services/api'

const endpoint = '/opcrs/:id/commitment-status'

export type UpdateCommitmentStatusPayload = {
  commitmentStatus: 'draft' | 'submitted' | 'approved' | 'rejected'
}

export const updateCommitmentStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCR>,
  QueryParams,
  UpdateCommitmentStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<OPCR>>(finalUrl, payload)
    return response.data
  },
}
