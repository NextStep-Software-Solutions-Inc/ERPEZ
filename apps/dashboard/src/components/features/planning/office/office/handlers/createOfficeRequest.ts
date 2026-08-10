import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { Office } from '../table/types'
import type { OfficeFormType } from '../form/CreateOfficeForm'
import api from '@/services/api'

const endpoint = '/offices'

export type CreateOfficePayload = Omit<OfficeFormType, never> & {
  clusterId?: string | null
  officeHead: string
  name: string
  description?: string | null
  address: string
  email: string
  contactNumber: string
  responsibilityCenterCode?: string | null
}

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
