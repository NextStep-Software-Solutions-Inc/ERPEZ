import type { WFPObjectiveTarget } from '../table/types'
import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfp-objective-activities'

export const getWFPObjectiveTargetsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<WFPObjectiveTarget>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<WFPObjectiveTarget>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
