import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { LineItemBudgetHistory } from '../types'

const endpoint = '/libs/:id/history'

export const getLIBHistoryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LineItemBudgetHistory[]>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<LineItemBudgetHistory>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
