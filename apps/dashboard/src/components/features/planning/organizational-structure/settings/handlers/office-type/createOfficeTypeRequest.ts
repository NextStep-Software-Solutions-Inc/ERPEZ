import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { OfficeTypeEntity, OfficeTypeFormValues } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'
  
const endpoint = '/office-types'

type CreateOfficeTypePayload = OfficeTypeFormValues

export const createOfficeTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeTypeEntity>,
  undefined,
  CreateOfficeTypePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OfficeTypeEntity>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
