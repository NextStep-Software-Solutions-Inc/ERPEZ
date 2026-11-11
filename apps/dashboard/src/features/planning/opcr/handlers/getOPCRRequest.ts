import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { OPCRDetails } from '../types/type.opcr'

import api from '@/services/api'

const endpoint = '/opcrs/:id'

export const getOPCRRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OPCRDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
  defaultOptions: {
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status
      if (
        status === 404 ||
        status === 400 ||
        status === 401 ||
        status === 403
      ) {
        return false
      }
      return failureCount < 2
    },
  },
}
