import type { APIResponse, MutationBlueprintFromTemplate, QueryParams } from 'erpez-shared-lib'
import { api } from '@/services/api'

const endpoint = '/resolution-clauses/:id'

export const deleteResolutionClauseRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<null>,
  QueryParams,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<null>>(finalUrl)
    return response.data
  },
}
