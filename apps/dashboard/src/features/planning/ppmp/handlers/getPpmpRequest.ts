import {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import { PPMPDetails } from '../types'
import api from '@/services/api'

const endpoint = '/ppmps/:id'

export const getPPMPRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PPMPDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
