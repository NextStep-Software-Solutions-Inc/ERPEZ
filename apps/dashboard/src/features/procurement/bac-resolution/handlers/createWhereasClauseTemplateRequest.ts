import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type {
  WhereasClauseTemplate,
  WhereasClauseTemplatePayload,
} from '../types'
import { api } from '@/services/api'

const endpoint = '/bac-resolution-whereas-clauses'

export const createWhereasClauseTemplateRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  WhereasClauseTemplate,
  undefined,
  WhereasClauseTemplatePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('WHEREAS template payload is required.')
    }

    const response = await api.post<APIResponse<WhereasClauseTemplate>>(finalUrl, payload)
    return response.data.data
  },
}
