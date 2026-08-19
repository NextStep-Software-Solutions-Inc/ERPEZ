/**
 * Create APR Request Handler
 * Mutation blueprint for creating a new APR with header, terms, and line items
 * Connects directly to backend POST /aprs
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateAPRCommandPayload } from '../types'

const endpoint = '/aprs' as const

export const createAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateAPRCommandPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload, body }: any) => {
    const data = payload || body
    if (!data) {
      throw new Error('createAPRRequest: Payload is required')
    }
    const response = await api.post<APIResponse<string>>(finalUrl, data)
    return response.data
  },
}
