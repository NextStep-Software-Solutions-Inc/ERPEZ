import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMPByFiscalYear } from '../types'

const endpoint = '/ppmps/by-fiscal-year/:fiscalYearId'

export const getPPMPsByFiscalYearRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PPMPByFiscalYear>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PPMPByFiscalYear>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
