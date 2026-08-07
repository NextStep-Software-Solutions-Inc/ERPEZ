import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/line-item-budget-details/:id'

export const deleteLineItemBudgetDetailsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<boolean>>(finalUrl)
    return response.data
  },
}
