import type { QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PositionCategorySetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-categories'

// Define the actual API response structure
export interface PositionCategoryApiResponse {
  succeeded: boolean
  message: string | null
  data: PositionCategorySetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getPositionCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PositionCategoryApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PositionCategoryApiResponse>(finalUrl, {
      signal,
    })
    return response.data
  },
}
