import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { PlantillaTypeSetting, PlantillaTypeFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/plantilla-types'

type CreatePlantillaTypePayload = PlantillaTypeFormValues

export const createPlantillaTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PlantillaTypeSetting>,
  undefined,
  CreatePlantillaTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PlantillaTypeSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
