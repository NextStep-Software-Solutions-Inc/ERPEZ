import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type {
  CreateWorkflowMatrixRequestPayload,
  WorkflowMatrix,
} from '../types/workflowMatrixTypes'

const endpoint = '/workflow-matrices'

export const createWorkflowMatrixRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WorkflowMatrix>,
  undefined,
  CreateWorkflowMatrixRequestPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<WorkflowMatrix>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
