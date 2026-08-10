import type { WFP } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import { api } from '@/services/api'

const endpoint = '/wfps'

export type CreateWFPPayload = {
  officeId: string
  projectTitle: string
  projectStartDate: string
  projectEndDate: string
  generalObjective?: string | null
}

export const createWFPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFP>,
  undefined,
  CreateWFPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<WFP>>(finalUrl, payload)
    return response.data
  },
}
