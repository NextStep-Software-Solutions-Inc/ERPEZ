import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { OfficeTypeEntity, OfficeTypeFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/office-types/:id'
type UpdateOfficeTypePayload = OfficeTypeFormValues
export const updateOfficeTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeTypeEntity>,
  undefined,
  UpdateOfficeTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OfficeTypeEntity>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
