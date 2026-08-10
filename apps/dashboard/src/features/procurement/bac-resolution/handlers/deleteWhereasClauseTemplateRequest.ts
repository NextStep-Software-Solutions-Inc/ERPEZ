import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { WhereasClauseTemplate } from '../types'
import { api } from '@/services/api'

const endpoint = '/bac-resolution-whereas-clauses/:id'

export const deleteWhereasClauseTemplateRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  WhereasClauseTemplate,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<WhereasClauseTemplate>>(finalUrl)
    return response.data.data
  },
}
