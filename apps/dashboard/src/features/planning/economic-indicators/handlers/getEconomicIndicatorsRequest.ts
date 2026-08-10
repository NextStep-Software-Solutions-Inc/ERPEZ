import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { EconomicIndicator } from '../components/table/data/economicIndicatorTypes'
import type { PaginationResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/economic-indicators'

export const getEconomicIndicatorsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<EconomicIndicator>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<EconomicIndicator>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}

export const getEconomicIndicatorByIdRequest: QueryBlueprintFromTemplate<
  `${typeof endpoint}/:id`,
  { data: EconomicIndicator },
  Record<string, never>,
  QueryKey
> = {
  endpoint: `${endpoint}/:id`,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ data: EconomicIndicator }>(finalUrl, {
      signal,
    })
    return response.data
  },
}
