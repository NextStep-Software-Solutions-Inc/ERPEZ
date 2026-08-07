import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { WorkflowMatrix } from '../types/workflowMatrixTypes'

const endpoint = '/workflow-matrices/:id'

export const getWorkflowMatrixRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WorkflowMatrix>,
  Record<string, never>,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<WorkflowMatrix>>(finalUrl, {
      signal,
    })
    return response.data
  },
}