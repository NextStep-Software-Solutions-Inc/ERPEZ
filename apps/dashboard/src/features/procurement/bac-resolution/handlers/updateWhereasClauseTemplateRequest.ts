import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type {
  BacResolutionWhereasClause,
} from '../types'
import { api } from '@/services/api'

const endpoint = '/bac-resolution-whereas-clauses/:id'
export type BacResolutionWhereasClausePayload = {
  name: string
  body: string
}
export const updateWhereasClauseTemplateRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolutionWhereasClause,
  undefined,
  BacResolutionWhereasClausePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<BacResolutionWhereasClause>>(finalUrl, payload)
    return response.data.data
  },
}
