import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import type { CommitmentStatus, OPCR } from '../types/type.opcr'
import api from '@/services/api'

const endpoint = '/opcrs/:id/commitment-status'

export type UpdateCommitmentStatusPayload = {
  commitmentStatus: CommitmentStatus
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
