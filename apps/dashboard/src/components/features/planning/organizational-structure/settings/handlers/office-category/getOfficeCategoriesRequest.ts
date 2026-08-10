import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { OfficeCategoryEntity } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/categories'

// Define the actual API response structure
export interface OfficeCategoryApiResponse {
  succeeded: boolean
  message: string | null
  data: OfficeCategoryEntity[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getOfficeCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  OfficeCategoryApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<OfficeCategoryApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
