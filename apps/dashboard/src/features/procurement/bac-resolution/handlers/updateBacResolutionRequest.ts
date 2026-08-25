import type { APIResponse, MutationBlueprintFromTemplate, QueryParams } from 'erpez-shared-lib'
import type { BacProject, BacResolution, CreateBacResolutionPayload } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects/:id'
export type UpdateBacProjectPayload = {

}
export const updateBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BacProject>,
  QueryParams,
  UpdateBacProjectPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<BacProject>>(finalUrl, payload)
    return response.data
  },
}
