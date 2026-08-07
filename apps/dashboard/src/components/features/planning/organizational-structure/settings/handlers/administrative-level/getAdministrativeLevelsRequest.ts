import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { AdministrativeLevel } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/administrative-levels'

// Define the actual API response structure
export interface AdministrativeLevelApiResponse {
  succeeded: boolean
  message: string | null
  data: AdministrativeLevel[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getAdministrativeLevelsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  AdministrativeLevelApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<AdministrativeLevelApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
