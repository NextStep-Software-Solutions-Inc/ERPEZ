import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { FiscalYear } from '../table/types'
import type {
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/fiscal-years'

export const getFiscalYearsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FiscalYear>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    // always call the real backend; we don't rely on in‑app mock flag here
    const response = await api.get<PaginationResponse<FiscalYear>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
