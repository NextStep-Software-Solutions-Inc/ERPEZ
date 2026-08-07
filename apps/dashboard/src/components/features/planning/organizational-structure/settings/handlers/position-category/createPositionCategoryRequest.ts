import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PositionCategoryFormValues, PositionCategorySetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/position-categories'

type CreatePositionCategoryPayload = PositionCategoryFormValues

export const createPositionCategoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PositionCategorySetting>,
  undefined,
  CreatePositionCategoryPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PositionCategorySetting>>(finalUrl, payload)
    return response.data
  },
}
