import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { PPMPActivity } from '../types'

const endpoint = '/ppmp-activities'

export const getPPMPActivitiesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PPMPActivity>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PPMPActivity>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
