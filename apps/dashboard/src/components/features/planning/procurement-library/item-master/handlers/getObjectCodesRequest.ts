import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ObjectCodeLookup } from '../types'

const endpoint = '/objects'

export const getObjectCodesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<ObjectCodeLookup>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<ObjectCodeLookup>>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
