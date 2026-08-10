import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type {
  ResolveApproversPayload,
  ResolveApproversResponse,
} from '../types/workflowMatrixTypes'

const endpoint = '/workflow-matrices/resolve-approvers'

export const resolveApproversRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ResolveApproversResponse>,
  undefined,
  ResolveApproversPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ResolveApproversResponse>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}