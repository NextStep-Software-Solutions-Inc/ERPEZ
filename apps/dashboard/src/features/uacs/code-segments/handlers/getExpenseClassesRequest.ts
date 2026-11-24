import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib'
import type { ExpenseClass } from '../types/expenseClassTypes'
import api from '@/services/api'

const endpoint = '/expense-classes'

export const getExpenseClassesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ExpenseClass>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ExpenseClass>>(finalUrl, { signal })
    return response.data
  },
}
