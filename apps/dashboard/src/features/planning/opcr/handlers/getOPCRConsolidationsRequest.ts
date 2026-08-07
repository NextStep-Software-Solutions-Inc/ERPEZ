import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { OPCRConsolidate } from '../types'

const endpoint = '/opcr-consolidations'

export const getConsolidatedOPCRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OPCRConsolidate>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OPCRConsolidate>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
