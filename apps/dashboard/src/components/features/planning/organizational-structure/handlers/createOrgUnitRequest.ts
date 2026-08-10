import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { OrgUnit } from '../table/types'
import type { CreateOfficeFormValues } from '../form/CreateOfficeForm'
import api from '@/services/api'

const endpoint = '/org-units'

type CreateOrgUnitPayload = Omit<CreateOfficeFormValues, 'id'>

export const createOrgUnitRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OrgUnit>,
  undefined,
  CreateOrgUnitPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OrgUnit>>(finalUrl, payload)
    return response.data
  },
}
