import type { WFPObjectiveTargetExpenditureResponse } from '@/features/planning/types/wfpApiTypes'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objective-activity-expenditures/:id'

export type UpdateWFPObjectiveTargetExpenditurePayload = {
  itemDescription: string
  quantity: number
  unitCost: number
}

export const updateWFPObjectiveTargetExpenditureRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjectiveTargetExpenditureResponse>,
  undefined,
  UpdateWFPObjectiveTargetExpenditurePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<WFPObjectiveTargetExpenditureResponse>>(finalUrl, payload)
    return response.data
  },
}
