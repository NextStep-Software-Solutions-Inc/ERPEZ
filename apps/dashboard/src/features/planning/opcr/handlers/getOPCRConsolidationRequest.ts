import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { OPCRConsolidateDetails } from '../types'

const endpoint = '/opcr-consolidations/:id'

export const getOPCRConsolidationRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRConsolidateDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OPCRConsolidateDetails>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
