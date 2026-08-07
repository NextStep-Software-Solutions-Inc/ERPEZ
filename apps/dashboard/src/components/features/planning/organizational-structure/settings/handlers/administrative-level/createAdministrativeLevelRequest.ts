import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AdministrativeLevel, AdministrativeLevelFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/administrative-levels'

type CreateAdministrativeLevelPayload = AdministrativeLevelFormValues

export const createAdministrativeLevelRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AdministrativeLevel>,
  undefined,
  CreateAdministrativeLevelPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<AdministrativeLevel>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
