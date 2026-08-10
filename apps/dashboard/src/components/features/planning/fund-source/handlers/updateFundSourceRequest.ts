import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FundSource } from '../table/types'
import type { UpdateFundSourceType } from '../form/UpdateFundSourceForm'
import type { QueryParams } from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/fund-sources/:id'
type UpdateFundSourcePayload = UpdateFundSourceType
export const updateFundSourceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FundSource>,
  QueryParams,
  UpdateFundSourcePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<FundSource>>(finalUrl, payload)
    return response.data
  },
}
