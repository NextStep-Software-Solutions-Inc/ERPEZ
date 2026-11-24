import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { UpdateExpenseClassPayload } from '../types/expenseClassTypes'
import api from '@/services/api'

const endpoint = '/expense-classes/:id'

export const updateExpenseClassRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  unknown,
  undefined,
  UpdateExpenseClassPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<unknown>>(finalUrl, payload)
    return response.data.data
  },
}
