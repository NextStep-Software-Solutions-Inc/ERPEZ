import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { Office } from '../table/types'
import api from '@/services/api'

const endpoint = '/offices/:id'

type UpdateOfficePayload = {
  clusterId?: string
  parentOfficeId?: string
}

export const updateOfficeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Office>,
  undefined,
  UpdateOfficePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<Office>>(finalUrl, payload)
    return response.data
  },
}
