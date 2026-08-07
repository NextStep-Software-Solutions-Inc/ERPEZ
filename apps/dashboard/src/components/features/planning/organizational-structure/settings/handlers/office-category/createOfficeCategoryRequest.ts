import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { OfficeCategoryEntity, OfficeCategoryFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'
  
const endpoint = '/categories'

type CreateOfficeCategoryPayload = OfficeCategoryFormValues

export const createOfficeCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeCategoryEntity>,
  undefined,
  CreateOfficeCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OfficeCategoryEntity>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
