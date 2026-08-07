import type { WFPObjective } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objectives/:id'

export type UpdateWFPObjectivePayload = {
  outcome: string
  weight: number
  description: string
}

export const updateWFPObjectiveRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjective>,
  undefined,
  UpdateWFPObjectivePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<WFPObjective>>(finalUrl, payload)
    return response.data
  },
}
