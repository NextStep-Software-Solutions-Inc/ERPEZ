/**
 * Get Budget Allocations Query Handler
 * 
 * Fetches list of budget allocations for a fiscal year
 * Pattern: Follows erpez-shared-lib QueryBlueprintFromTemplate
 */

import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { BudgetAllocation } from '../atoms'

const endpoint = '/budget-allocations'

export const getBudgetAllocationsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BudgetAllocation[]>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<BudgetAllocation[]>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
