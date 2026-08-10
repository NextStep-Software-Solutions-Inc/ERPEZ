/**
 * Update Budget Allocation Mutation Handler
 * 
 * Updates an existing budget allocation
 * Pattern: Follows erpez-shared-lib MutationBlueprintFromTemplate
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { BudgetAllocation } from '../form/BudgetDistributionForm'

const endpoint = '/budget-allocations/:id'

type UpdateBudgetAllocationPayload = Partial<BudgetAllocation>

export const updateBudgetAllocationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BudgetAllocation>,
  undefined,
  UpdateBudgetAllocationPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<BudgetAllocation>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
