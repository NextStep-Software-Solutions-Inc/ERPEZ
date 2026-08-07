import type { QueryBlueprintFromTemplate, APIResponse, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PersonnelReportingTypeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/personnel-reporting-types/:id'

export const getPersonnelReportingTypeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PersonnelReportingTypeSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PersonnelReportingTypeSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
