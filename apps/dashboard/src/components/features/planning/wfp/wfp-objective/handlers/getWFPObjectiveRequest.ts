import type { WFPObjective } from '../table/types'
import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/wfp-objectives/:id'

export const getWFPObjectiveRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPObjective>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<WFPObjective>>(finalUrl, { signal })
    return response.data
  },
}
