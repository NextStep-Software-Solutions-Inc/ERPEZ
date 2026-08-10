import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PaginationResponse } from 'erpez-shared-lib'
import { PerformanceMeasure } from '@/components/features/planning/performance-measure/types'

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
      { signal },
    )
    return response.data
  },
}
