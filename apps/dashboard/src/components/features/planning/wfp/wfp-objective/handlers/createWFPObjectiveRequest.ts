import type { WFPObjective } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objectives'

export type CreateWFPObjectivePayload = {
  wfpId: string
  wfpObjectives: Array<{
    description: string
    weight: number
    outcome?: string
  }>
}

export const createWFPObjectiveRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<WFPObjective>>,
  undefined,
  CreateWFPObjectivePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<Array<WFPObjective>>>(finalUrl, payload)
    return response.data
  },
}
