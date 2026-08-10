import type { QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PersonnelReportingTypeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/personnel-reporting-types'

export interface PersonnelReportingTypeApiResponse {
  succeeded: boolean
  message: string | null
  data: PersonnelReportingTypeSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getPersonnelReportingTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PersonnelReportingTypeApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PersonnelReportingTypeApiResponse>(finalUrl, {
      signal,
    })
    return response.data
  },
}
