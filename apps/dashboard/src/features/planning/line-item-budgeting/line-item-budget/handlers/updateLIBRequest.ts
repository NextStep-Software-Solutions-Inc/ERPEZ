import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LIB } from '../types'

const endpoint = '/libs/:id'

export type UpdateLIBPayload = {
  name?: string
  scope?: string
  level?: string
  parentLIBId?: string
  consolidatedIntoLIBId?: string
  fiscalYearId?: string
  fundSourceId?: string
  officeId?: string
}

export const updateLIBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIB>,
  QueryParams,
  UpdateLIBPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<LIB>>(finalUrl, payload)
    return response.data
  },
}
