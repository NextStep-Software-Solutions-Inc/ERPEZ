import type { WFPObjectiveTargetExpenditureResponse } from '@/features/planning/types/wfpApiTypes'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objective-activities/:wfpObjectiveTargetId/expenditures'

export type CreateWFPObjectiveTargetExpenditurePayload = Array<{
  objectId: string
  quantity: number
  itemDescription: string
  unitCost: number
}>

export const createWFPObjectiveTargetExpenditureRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjectiveTargetExpenditureResponse>,
  { wfpObjectiveTargetId: string },
  CreateWFPObjectiveTargetExpenditurePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<WFPObjectiveTargetExpenditureResponse>>(finalUrl, payload)
    return response.data
  },
}
