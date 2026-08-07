import type { APIResponse, QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { WhereasClauseTemplate } from '../types'
import { api } from '@/services/api'

const endpoint = '/bac-resolution-whereas-clauses'

export const getWhereasClauseTemplatesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  WhereasClauseTemplate[],
  undefined
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<WhereasClauseTemplate[]>>(finalUrl, {
      signal,
    })

    return response.data.data
  },
}
