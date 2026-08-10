import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type {
  UpdateWorkflowMatrixPayload,
  WorkflowMatrix,
} from '../types/workflowMatrixTypes'

const endpoint = '/workflow-matrices/:id'

export const updateWorkflowMatrixRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WorkflowMatrix>,
  undefined,
  UpdateWorkflowMatrixPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<WorkflowMatrix>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
