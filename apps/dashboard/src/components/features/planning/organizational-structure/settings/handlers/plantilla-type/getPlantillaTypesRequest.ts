import type { QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PlantillaTypeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/plantilla-types'

// Define the actual API response structure
export interface PlantillaTypeApiResponse {
  succeeded: boolean
  message: string | null
  data: PlantillaTypeSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getPlantillaTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PlantillaTypeApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PlantillaTypeApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
