import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  APIResponse,
} from 'erpez-shared-lib'
import type { OrgUnit } from '../table/types'
import api from '@/services/api'

const endpoint = '/offices/{id}'

export const getOrgUnitRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OrgUnit>,
  never,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OrgUnit>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
