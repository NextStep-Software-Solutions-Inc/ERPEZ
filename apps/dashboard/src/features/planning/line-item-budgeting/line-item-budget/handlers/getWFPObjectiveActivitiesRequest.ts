import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { WFPObjectiveActivity } from '@/features/planning/wfp/types/type.wfp'

const endpoint = '/wfp-objective-activities'
export const getWFPObjectiveActivitiesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<WFPObjectiveActivity>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<WFPObjectiveActivity>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
