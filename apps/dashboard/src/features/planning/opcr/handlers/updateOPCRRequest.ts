import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import type { OPCR } from '../types/type.opcr'
import api from '@/services/api'

const endpoint = '/opcrs/:id'

export type UpdateOPCRPayload = {
  officeId?: string
  fiscalYearId?: string
  name?: string
}

export const updateOPCRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCR>,
  QueryParams,
  UpdateOPCRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OPCR>>(finalUrl, payload)
    return response.data
  },
}
