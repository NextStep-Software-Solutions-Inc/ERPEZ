import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { SatelliteClusterSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/clusters'

// Define the actual API response structure
export interface ClusterApiResponse {
  succeeded: boolean
  message: string | null
  data: SatelliteClusterSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getClustersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  ClusterApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<ClusterApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
