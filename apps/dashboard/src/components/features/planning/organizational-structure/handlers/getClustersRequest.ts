import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
import type { OrgUnit } from '../table/types'
import api from '@/services/api'
import { Cluster } from '../../office/office/table/types';

const endpoint = '/clusters'

export const getClustersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Cluster>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<Cluster>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
