import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PositionCategoryFormValues, PositionCategorySetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-categories/:id'

type UpdatePositionCategoryPayload = PositionCategoryFormValues

export const updatePositionCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PositionCategorySetting>,
  undefined,
  UpdatePositionCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PositionCategorySetting>>(finalUrl, payload)
    return response.data
  },
}
