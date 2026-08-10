import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LineItemBudgetDetails } from '../types/types'

const endpoint = '/line-item-budget-details'

export type CreateLineItemBudgetDetailsPayload = {
  lineItemBudgetId: string
  lineItemBudgetActivityId?: string
  wfpObjectiveActivityExpenditureId?: string
  objectId: string
  description?: string
  unitQuantity?: number
  unitCost?: number
  timelineType?: string
  startDate?: string
  endDate?: string
  budget: number
}

export const createLineItemBudgetDetailsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LineItemBudgetDetails>,
  undefined,
  CreateLineItemBudgetDetailsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<LineItemBudgetDetails>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
