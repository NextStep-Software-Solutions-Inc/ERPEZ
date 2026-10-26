import {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

export type LIBActivityObjectItemResponse = {
  id: string
  code: string
  name: string
  totalBudget: number
}

export type LIBActivityObjectResponse = {
  parentObjectId: string
  parentObjectCode: string
  parentObjectName: string
  items: LIBActivityObjectItemResponse[]
}

export type GetLIBActivityObjectsQueryParams = QueryParams & {
  LIBActivityId: string
}
const endpoint = '/line-item-budget-details/activity-objects'

export const getLIBActivityObjectsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<LIBActivityObjectResponse>>,
  GetLIBActivityObjectsQueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<
      APIResponse<Array<LIBActivityObjectResponse>>
    >(finalUrl, { signal })
    return response.data
  },
}

