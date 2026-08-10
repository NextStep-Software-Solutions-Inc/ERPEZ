import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { Position } from '../table/types'
import type { UpdatePositionFormValues } from '../form/UpdatePositionForm'
import api from '@/services/api'

const endpoint = '/positions/:id'

type UpdatePositionPayload = Omit<UpdatePositionFormValues, 'id'>

export const updatePositionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Position>,
  { id: string },
  UpdatePositionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<Position>>(finalUrl, payload)
    return response.data
  },
}
