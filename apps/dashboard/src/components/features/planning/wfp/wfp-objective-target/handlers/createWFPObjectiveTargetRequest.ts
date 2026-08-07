import type { WFPObjectiveTarget } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objective-activities'

export type CreateWFPObjectiveTargetPayload = {
  wfpId?: string
  wfpObjectiveId?: string
  opcrActivityId?: string
  activityName: string
  indicator: string
  weight?: number
  dates?: Array<{
    timelineType: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual'
    startDate: string
    endDate: string
    value: number
  }>
}

export const createWFPObjectiveTargetRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjectiveTarget>,
  undefined,
  CreateWFPObjectiveTargetPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<WFPObjectiveTarget>>(finalUrl, payload)
    return response.data
  },
}

export const createWFPObjectiveActivityRequest = createWFPObjectiveTargetRequest
