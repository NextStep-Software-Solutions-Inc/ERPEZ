import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { BudgetCall } from '../types'
import api from '@/services/api'

const endpoint = '/budget-calls'

export type CreateBudgetCallPayload = {
  fiscalYearId: string
  type: string
  submissionDeadline: string // ISO string
}

export const createBudgetCallRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BudgetCall>,
  undefined,
  CreateBudgetCallPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<BudgetCall>>(finalUrl, payload)
    return response.data
  },
}
