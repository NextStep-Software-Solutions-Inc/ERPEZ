import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { Position } from '../table/types'
import type { CreatePositionFormValues } from '../form/CreatePositionForm'
import api from '@/services/api'

const endpoint = '/positions'

type CreatePositionPayload = Omit<CreatePositionFormValues, 'id'>

export const createPositionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Position>,
  undefined,
  CreatePositionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<Position>>(finalUrl, payload)
    return response.data
  },
}
