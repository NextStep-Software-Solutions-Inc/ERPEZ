import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import type { OPCR } from '../types/type.opcr'
import api from '@/services/api'

const endpoint = '/opcrs/:id/status'

export type SubmitOPCRPayload = {
  status: string
}

export const submitOPCRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCR>,
  QueryParams,
  SubmitOPCRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OPCR>>(finalUrl, payload)
    return response.data
  },
}
