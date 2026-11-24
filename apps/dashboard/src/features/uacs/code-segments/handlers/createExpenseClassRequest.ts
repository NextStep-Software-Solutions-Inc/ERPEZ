import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { CreateExpenseClassPayload } from '../types/expenseClassTypes'
import api from '@/services/api'

const endpoint = '/expense-classes'

export const createExpenseClassRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  string,
  undefined,
  CreateExpenseClassPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data.data
  },
}
