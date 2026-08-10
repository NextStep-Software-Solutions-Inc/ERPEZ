import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { OfficeCeiling } from '../types'

const endpoint = '/office-ceilings'

export const getOfficeCeilingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OfficeCeiling>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OfficeCeiling>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
