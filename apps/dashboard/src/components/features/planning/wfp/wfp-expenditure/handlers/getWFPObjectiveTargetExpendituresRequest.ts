import type { WFPObjectiveTargetExpenditure } from '../table/types'
import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/wfp-objective-activity-expenditures'

export const getWFPObjectiveTargetExpendituresRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<WFPObjectiveTargetExpenditure>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<WFPObjectiveTargetExpenditure>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
