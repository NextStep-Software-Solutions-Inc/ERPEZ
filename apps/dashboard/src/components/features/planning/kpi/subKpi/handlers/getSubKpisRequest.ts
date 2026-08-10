/**
 * getSubKpisRequest Handler
 * Fetches paginated list of SubKPIs for a given parent KPI
 * Follows Request Blueprint Pattern from erpez-shared-lib
 */
import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
// import type { SubKPI } from '../types'
import type { KPI } from '../../types'
import api from '@/services/api'

/** API endpoint for fetching SubKPIs */
const endpoint = '/kpis'

/**
 * Query blueprint for fetching SubKPIs with pagination
 * Uses ParentKPIId filter to get SubKPIs under a specific parent KPI
 */
export const getSubKpisRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<KPI>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<KPI>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
