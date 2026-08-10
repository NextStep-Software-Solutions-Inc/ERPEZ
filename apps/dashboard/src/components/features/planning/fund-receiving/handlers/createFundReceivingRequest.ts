import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FundReceiving } from '../table/types'
import type { CreateFundReceivingType } from '../form/CreateFundReceivingForm'
import api from '@/services/api'

const endpoint = '/received-funds'

type CreateFundReceivingPayload = CreateFundReceivingType

export const createFundReceivingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FundReceiving>,
  undefined,
  CreateFundReceivingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<FundReceiving>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
