import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/budget-calls/:id/status'

export type ChangeBudgetCallStatusPayload = {
  status: 'Draft' | 'Active' | 'Closed' | string
}

export const changeBudgetCallStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<null>,
  undefined,
  ChangeBudgetCallStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<null>>(finalUrl, payload)
    return response.data
  },
}
