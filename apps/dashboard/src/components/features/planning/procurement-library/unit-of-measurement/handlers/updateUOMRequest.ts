import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdateUOMPayload, UOMApiItem } from '../types'

const endpoint = '/uoms/:id'

export const updateUOMRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<UOMApiItem>,
  undefined,
  UpdateUOMPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<UOMApiItem>>(finalUrl, payload)
    return response.data
  },
}
