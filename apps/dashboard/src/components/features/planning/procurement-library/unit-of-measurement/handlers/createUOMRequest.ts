import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateUOMPayload, UOMApiItem } from '../types'

const endpoint = '/uoms'

export const createUOMRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<UOMApiItem>,
  undefined,
  CreateUOMPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<UOMApiItem>>(finalUrl, payload)
    return response.data
  },
}
