import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import { DirectContracting } from '../types'
import api from '@/services/api'

const endpoint = '/direct-contracting'
export const getDirectContractingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<DirectContracting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url, queryParams }) => [url, queryParams],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<DirectContracting>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
