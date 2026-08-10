import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { PerformanceMeasure } from '../types'
import type {
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/performance-measures'

export const getPerformanceMeasuresRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PerformanceMeasure>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PerformanceMeasure>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
