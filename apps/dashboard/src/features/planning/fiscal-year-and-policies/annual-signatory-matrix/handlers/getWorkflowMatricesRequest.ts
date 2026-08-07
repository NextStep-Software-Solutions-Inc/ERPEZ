import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { WorkflowMatrix } from '../types/workflowMatrixTypes'

const endpoint = '/workflow-matrices'

export const getWorkflowMatricesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<WorkflowMatrix>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<WorkflowMatrix>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}