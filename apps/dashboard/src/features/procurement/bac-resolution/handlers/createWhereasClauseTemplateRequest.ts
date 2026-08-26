import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolutionWhereasClause } from '../types'
import { api } from '@/services/api'

const endpoint = '/bac-resolution-whereas-clauses'
export type BacResolutionWhereasClausePayload = {
  name: string
  body: string
}

export const createWhereasClauseTemplateRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolutionWhereasClause,
  undefined,
  BacResolutionWhereasClausePayload> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('WHEREAS template payload is required.')
    }

    const response = await api.post<APIResponse<BacResolutionWhereasClause>>(finalUrl, payload)
    return response.data.data
  },
}
