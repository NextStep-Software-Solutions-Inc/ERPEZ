import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { WFPObjectiveActivityDetails } from '@/features/planning/wfp/types/type.wfp'

const endpoint = '/wfp-objective-activities/:id'

export const getWFPObjectiveActivityRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjectiveActivityDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<WFPObjectiveActivityDetails>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
