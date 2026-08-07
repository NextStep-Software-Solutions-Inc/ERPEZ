import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { PlantillaTypeSetting, PlantillaTypeFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/plantilla-types/:id'
type UpdatePlantillaTypePayload = PlantillaTypeFormValues
export const updatePlantillaTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PlantillaTypeSetting>,
  undefined,
  UpdatePlantillaTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PlantillaTypeSetting>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
