import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { FiscalYear } from '../table/types'

import api from '@/services/api'

const endpoint = '/fiscal-years/:id'

export const getFiscalYearRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FiscalYear>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<FiscalYear>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
