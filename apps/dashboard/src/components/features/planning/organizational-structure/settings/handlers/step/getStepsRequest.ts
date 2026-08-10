import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { StepSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/steps'

// Define the actual API response structure
export interface StepApiResponse {
  succeeded: boolean
  message: string | null
  data: StepSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getStepsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  StepApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<StepApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
