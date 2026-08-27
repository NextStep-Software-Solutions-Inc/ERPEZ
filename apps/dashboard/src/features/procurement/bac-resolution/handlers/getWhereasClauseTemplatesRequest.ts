import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { WhereasClauseTemplate } from '../types'

const endpoint = '/bac-resolution-whereas-clauses'

export const getWhereasClauseTemplatesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<WhereasClauseTemplate>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<WhereasClauseTemplate>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
