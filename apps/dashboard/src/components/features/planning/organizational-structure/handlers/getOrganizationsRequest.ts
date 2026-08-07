import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
import type { OrgUnit } from '../table/types'
import api from '@/services/api'

const endpoint = '/organizations'

export const getOrganizationsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OrgUnit>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OrgUnit>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
