import type { WFPObjectiveTargetExpenditureResponse } from '@/features/planning/types/wfpApiTypes'
import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objective-activity-expenditures/:id'

export const getWFPObjectiveTargetExpenditureRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjectiveTargetExpenditureResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<WFPObjectiveTargetExpenditureResponse>>(finalUrl, { signal })
    return response.data
  },
}
