import type { DeliveryUnit } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/delivery-units'

type CreateDeliveryUnitPayload = {
  officeId: string
  parentDUId?: string
}

export const createDeliveryUnitRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DeliveryUnit>,
  undefined,
  CreateDeliveryUnitPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<DeliveryUnit>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
