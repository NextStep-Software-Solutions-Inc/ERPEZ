import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AdministrativeLevel, AdministrativeLevelFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/administrative-levels/:id'
type UpdateAdministrativeLevelPayload = AdministrativeLevelFormValues
export const updateAdministrativeLevelRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AdministrativeLevel>,
  undefined,
  UpdateAdministrativeLevelPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<AdministrativeLevel>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
