import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LIB } from '../types'

const endpoint = '/libs'

export type CreateLIBPayload = {
  fiscalYearId?: string
  agencyMasterBudgetId?: string
  fundSourceId?: string
  officeId?: string
  parentLIBId?: string
  scope?: string
  level?: string
  name?: string
  sourceType?: string
  sourceId?: string
  consolidatedIntoLIBId?: string
  totalAmount?: number
}
export const createLIBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIB>,
  undefined,
  CreateLIBPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<LIB>>(finalUrl, payload)
    return response.data
  },
}
