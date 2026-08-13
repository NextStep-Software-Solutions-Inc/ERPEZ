import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { Office } from '../table/types'
import type { OfficeFormType } from '../form/CreateOfficeForm'
import api from '@/services/api'

const endpoint = '/offices'

export type CreateOfficePayload = OfficeFormType

export const createOfficeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Office>,
  undefined,
  CreateOfficePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<Office>>(finalUrl, payload)
    return response.data
  },
}
