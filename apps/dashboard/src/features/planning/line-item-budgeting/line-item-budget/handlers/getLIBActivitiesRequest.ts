import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LIBActivity } from '../types'

const endpoint = '/lib-activities'
export const getLIBActivitiesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<LIBActivity>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<LIBActivity>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
