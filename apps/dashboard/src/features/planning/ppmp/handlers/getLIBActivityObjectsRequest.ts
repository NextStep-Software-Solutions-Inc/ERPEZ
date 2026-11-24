import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/line-item-budget-details/activity-objects'

export type LIBActivityObjectItem = {
  objectId: string
  objectCode: string | null
  objectName: string | null
  totalBudget: number
}

export type GetLIBActivityObjectsQueryParams = QueryParams & {
  LIBActivityId: string
}

export const getLIBActivityObjectsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<LIBActivityObjectItem>,
  GetLIBActivityObjectsQueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<LIBActivityObjectItem>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}

