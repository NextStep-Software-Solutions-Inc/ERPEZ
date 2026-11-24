import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LineItemBudgetDetails } from '../types/types'

const endpoint = '/line-item-budget-details/:id'

export type UpdateLineItemBudgetDetailsPayload = {
  lineItemBudgetId?: string
  lineItemBudgetActivityId?: string
  wfpObjectiveActivityExpenditureId?: string
  objectId?: string
  description?: string
  unitQuantity?: number
  unitCost?: number
  timelineType?: string
  startDate?: string
  endDate?: string
  budget?: number
}

export const updateLineItemBudgetDetailsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LineItemBudgetDetails | unknown>,
  undefined,
  UpdateLineItemBudgetDetailsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<LineItemBudgetDetails | unknown>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
