import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type {
  PatchWorkflowMatrixPayload,
  WorkflowMatrix,
} from '../types/workflowMatrixTypes'

const endpoint = '/workflow-matrices/:id'

export const patchWorkflowMatrixRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WorkflowMatrix>,
  undefined,
  PatchWorkflowMatrixPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<WorkflowMatrix>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
