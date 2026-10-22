/**
 * Trigger PSDBM Sync Request Handler
 * Mutation blueprint for triggering catalogue and stock synchronization
 * 
 * Endpoint: POST /api/psdbm/sync
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PSDBMSyncRequest, PSDBMSyncResult } from '../types'

const endpoint = '/api/psdbm/sync' as const

export const triggerPSDBMSyncRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PSDBMSyncResult>,
  undefined,
  PSDBMSyncRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PSDBMSyncResult>>(
      finalUrl,
      payload,
      {
        timeout: 300000, // 5 minutes timeout for depot synchronization & web crawling
      },
    )
    return response.data
  },
}
