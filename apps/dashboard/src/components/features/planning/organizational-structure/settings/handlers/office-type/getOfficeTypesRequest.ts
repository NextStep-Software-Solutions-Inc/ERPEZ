import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { OfficeTypeEntity } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/office-types'

// Define the actual API response structure
export interface OfficeTypeApiResponse {
  succeeded: boolean
  message: string | null
  data: OfficeTypeEntity[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getOfficeTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  OfficeTypeApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<OfficeTypeApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
