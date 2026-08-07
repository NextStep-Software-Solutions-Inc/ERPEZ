import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { Personnel } from '../table/types'
import type { UpdatePersonnelFormValues } from '../form/UpdatePersonnelForm'
import api from '@/services/api'

const endpoint = '/personnel/{id}'

type UpdatePersonnelPayload = Omit<UpdatePersonnelFormValues, 'id'>

export const updatePersonnelRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Personnel>,
  { id: string },
  UpdatePersonnelPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<Personnel>>(finalUrl, payload)
    return response.data
  },
}
