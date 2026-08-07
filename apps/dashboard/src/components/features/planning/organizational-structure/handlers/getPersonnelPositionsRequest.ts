import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
import type { PersonnelPositionApiResponse } from '@/services/api/personnelPositions'
import api from '@/services/api'

const endpoint = '/personnel-positions'

export const getPersonnelPositionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PersonnelPositionApiResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<
      PaginationResponse<PersonnelPositionApiResponse>
    >(finalUrl, {
      signal,
    })
    return response.data
  },
}
