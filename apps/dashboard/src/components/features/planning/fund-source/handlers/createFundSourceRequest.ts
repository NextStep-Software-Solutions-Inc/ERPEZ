import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FundSource } from '../table/types'
import type { CreateFundSourceType } from '../form/CreateFundSourceForm'
import api from '@/services/api'

const endpoint = '/fund-sources'

type CreateFundSourcePayload = CreateFundSourceType

export const createFundSourceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FundSource>,
  undefined,
  CreateFundSourcePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<FundSource>>(finalUrl, payload)
    return response.data
  },
}
