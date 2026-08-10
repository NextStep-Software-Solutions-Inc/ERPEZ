import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LIBActivity } from '../types/type.lib-activity'

const endpoint = '/lib-activities'

export type CreateLIBActivityPayload = {
  lineItemBudgetId: string
  wfpObjectiveActivityId?: string
  opcrActivityId?: string
  name?: string
}

export const createLIBActivityRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBActivity>,
  undefined,
  CreateLIBActivityPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<LIBActivity>>(finalUrl, payload)
    return response.data
  },
}
