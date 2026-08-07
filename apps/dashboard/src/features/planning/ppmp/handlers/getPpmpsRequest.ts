import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
import type { PPMP } from '../types'
import api from '@/services/api'

const endpoint = '/ppmps'

export const getPPMPsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PPMP>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PPMP>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
