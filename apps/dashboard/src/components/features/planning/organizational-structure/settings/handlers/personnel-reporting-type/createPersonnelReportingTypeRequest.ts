import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PersonnelReportingTypeFormValues, PersonnelReportingTypeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/personnel-reporting-types'

type CreatePersonnelReportingTypePayload = PersonnelReportingTypeFormValues

export const createPersonnelReportingTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PersonnelReportingTypeSetting>,
  undefined,
  CreatePersonnelReportingTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PersonnelReportingTypeSetting>>(finalUrl, payload)
    return response.data
  },
}
