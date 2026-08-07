import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import type { Attribute } from '../types'
import api from '@/services/api'

const endpoint = '/attributes'

export const getAttributesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Attribute>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<Attribute>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
