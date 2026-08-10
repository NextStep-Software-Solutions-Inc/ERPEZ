import {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import { ProcurementItemDetails } from '../types'
import api from '@/services/api'

const endpoint = '/procurement-items/:id'
export const getProcurementItemRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementItemDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProcurementItemDetails>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
