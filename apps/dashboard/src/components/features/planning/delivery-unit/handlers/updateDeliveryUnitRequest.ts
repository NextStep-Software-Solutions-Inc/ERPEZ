import type { DeliveryUnit } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/delivery-units/:id'

type UpdateDeliveryUnitPayload = {
  officeId?: string
  parentDUId?: string
}

export const updateDeliveryUnitRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DeliveryUnit>,
  undefined,
  UpdateDeliveryUnitPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<DeliveryUnit>>(finalUrl, payload)
    return response.data
  },
}
