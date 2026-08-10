import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { OfficeCategoryEntity, OfficeCategoryFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/categories/:id'
type UpdateOfficeCategoryPayload = OfficeCategoryFormValues
export const updateOfficeCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeCategoryEntity>,
  undefined,
  UpdateOfficeCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OfficeCategoryEntity>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
