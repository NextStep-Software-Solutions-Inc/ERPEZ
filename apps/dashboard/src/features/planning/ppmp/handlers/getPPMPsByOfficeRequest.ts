import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { PPMPByOffice } from '../types'

const endpoint = '/ppmps/by-office/:officeId'

export const getPPMPsByOfficeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PPMPByOffice>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PPMPByOffice>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
