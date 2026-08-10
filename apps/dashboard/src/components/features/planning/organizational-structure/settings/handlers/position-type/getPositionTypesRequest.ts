import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { PositionTypeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-types'

// Define the actual API response structure
export interface PositionTypeApiResponse {
  succeeded: boolean
  message: string | null
  data: PositionTypeSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getPositionTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PositionTypeApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PositionTypeApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
