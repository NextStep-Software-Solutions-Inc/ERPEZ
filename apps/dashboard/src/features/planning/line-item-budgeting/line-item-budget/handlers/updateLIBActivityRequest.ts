import type {
  MutationBlueprintFromTemplate,
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LIBActivity } from '../types'

const endpoint = '/lib-activities/:id'
export type UpdateLIBActivityPayload = {
  lineItemBudgetId: string
  wfpObjectiveActivityId?: string
  opcrActivityId?: string
  name?: string
  papCode?: string
}

export const updateLIBActivityRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBActivity>,
  QueryParams,
  UpdateLIBActivityPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<LIBActivity>>(finalUrl, payload)
    return response.data
  },
}
