import type { QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'
import type { SalaryGradeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/salary-grades'

// Define the actual API response structure
export interface SalaryGradeApiResponse {
  succeeded: boolean
  message: string | null
  data: SalaryGradeSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getSalaryGradesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  SalaryGradeApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<SalaryGradeApiResponse>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
