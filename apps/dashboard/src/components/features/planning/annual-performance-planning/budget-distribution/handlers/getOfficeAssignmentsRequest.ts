/**
 * Get Office Assignments Query Handler
 * 
 * Fetches list of office assignments for KPIs
 * Pattern: Follows erpez-shared-lib QueryBlueprintFromTemplate
 */

import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { OfficeAssignment } from '../types'

const endpoint = '/office-assignments'

export const getOfficeAssignmentsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeAssignment[]>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OfficeAssignment[]>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
