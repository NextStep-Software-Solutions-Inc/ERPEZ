import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { OrgUnit } from '../table/types'
import type { UpdateOfficeFormValues } from '../form/UpdateOfficeForm'
import api from '@/services/api'

const endpoint = '/org-units/{id}'

type UpdateOrgUnitPayload = Omit<UpdateOfficeFormValues, 'id'>

export const updateOrgUnitRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OrgUnit>,
  { id: string },
  UpdateOrgUnitPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OrgUnit>>(finalUrl, payload)
    return response.data
  },
}
