import type { QueryParams } from 'erpez-shared-lib/dist/types/Blueprint'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FundReceiving } from '../table/types'
import type { UpdateFundReceivingFormType } from '../form/UpdateFundReceivingForm'
import api from '@/services/api'

const endpoint = '/received-funds/:id'
type UpdateFundReceivingPayload = UpdateFundReceivingFormType
export const updateFundReceivingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FundReceiving>,
  QueryParams,
  UpdateFundReceivingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<FundReceiving>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
