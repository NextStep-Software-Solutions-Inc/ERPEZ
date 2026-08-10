import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PersonnelReportingTypeFormValues, PersonnelReportingTypeSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/personnel-reporting-types/:id'

type UpdatePersonnelReportingTypePayload = PersonnelReportingTypeFormValues

export const updatePersonnelReportingTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PersonnelReportingTypeSetting>,
  undefined,
  UpdatePersonnelReportingTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PersonnelReportingTypeSetting>>(finalUrl, payload)
    return response.data
  },
}
