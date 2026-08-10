import type { WFPObjectiveTarget } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objective-activities/:id'

export type UpdateWFPObjectiveTargetPayload = {
  activityName?: string
  weight?: number
  indicator?: string | number | null
}

export const updateWFPObjectiveTargetRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjectiveTarget>,
  undefined,
  UpdateWFPObjectiveTargetPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<WFPObjectiveTarget>>(finalUrl, payload)
    return response.data
  },
}
