import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { OPCRActivity } from '../types'

const endpoint = '/opcr-activities'

export const getOPCRActivitiesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OPCRActivity>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OPCRActivity>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
