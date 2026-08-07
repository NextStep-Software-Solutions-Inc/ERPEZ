import type {
  APIResponse,
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { OPCRItem } from '../types'

const endpoint = '/opcr-items'

export type OPCRItemsQueryParams = QueryParams & {
  includeRatings?: boolean
}

export type OPCRItemsResponse =
  | APIResponse<Array<OPCRItem>>
  | PaginationResponse<OPCRItem>
  | Array<OPCRItem>

type GetOPCRItemsArgs = {
  finalUrl?: string
  signal?: AbortSignal
}

export async function getOPCRItems({
  finalUrl = endpoint,
  signal,
}: GetOPCRItemsArgs = {}): Promise<OPCRItemsResponse> {
  const response = await api.get<OPCRItemsResponse>(finalUrl, { signal })
  return response.data
}

export const getOPCRItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  OPCRItemsResponse,
  OPCRItemsQueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => getOPCRItems({ finalUrl, signal }),
}

export function getOPCRItemsFromResponse(
  response: OPCRItemsResponse | undefined,
): Array<OPCRItem> {
  if (Array.isArray(response)) return response
  return response?.data ?? []
}
