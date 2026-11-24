import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/expense-classes/:id'

export const deleteExpenseClassRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  unknown
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<unknown>>(finalUrl)
    return response.data?.data
  },
}
