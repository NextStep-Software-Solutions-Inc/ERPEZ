import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { FundReceiving } from '../table/types'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/received-funds/:id'

// NOTE: This handler returns a single FundReceiving object as APIResponse<FundReceiving>.
// All consumers (e.g., UpdateFundReceivingDialog) must expect fundReceivingData to be an object, not an array.
export const getFundReceivingRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FundReceiving>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<FundReceiving>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
