import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { ProcurementWorkflowSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/procurement-workflows'

// Define the actual API response structure
export interface ProcurementWorkflowApiResponse {
  succeeded: boolean
  message: string | null
  data: ProcurementWorkflowSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getProcurementWorkflowsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  ProcurementWorkflowApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<ProcurementWorkflowApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
