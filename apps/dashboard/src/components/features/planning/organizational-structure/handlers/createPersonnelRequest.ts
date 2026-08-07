import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { Personnel } from '../table/types'
import type { CreatePersonnelFormValues } from '../form/CreatePersonnelForm'
import api from '@/services/api'

const endpoint = '/personnel'

type CreatePersonnelPayload = Omit<CreatePersonnelFormValues, 'id'>

export const createPersonnelRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Personnel>,
  undefined,
  CreatePersonnelPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<Personnel>>(finalUrl, payload)
    return response.data
  },
}
