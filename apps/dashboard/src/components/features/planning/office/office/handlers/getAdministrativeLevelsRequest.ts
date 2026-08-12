import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { AdministrativeLevel } from '../table/types'
import api from '@/services/api'

const endpoint = '/administrative-levels'

export const getAdministrativeLevelsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<AdministrativeLevel>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<AdministrativeLevel>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
