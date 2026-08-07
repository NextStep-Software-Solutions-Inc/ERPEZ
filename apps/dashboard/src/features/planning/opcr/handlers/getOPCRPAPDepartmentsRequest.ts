import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { OPCRPAPDepartment } from '../types'

const endpoint = '/opcr-pap-departments'

export const getOPCRPAPDepartmentsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<OPCRPAPDepartment>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<OPCRPAPDepartment>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
