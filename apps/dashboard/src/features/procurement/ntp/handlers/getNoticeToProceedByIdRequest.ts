/**
 * GET /notice-to-proceed/{id}
 * Retrieve detailed Notice to Proceed by ID.
 */

import type { APIResponse, QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import api from '@/services/api'
import type { NoticeToProceedDetail } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/:id' as const

export const getNoticeToProceedByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<NoticeToProceedDetail>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<NoticeToProceedDetail>>(finalUrl, { signal })
    return response.data
  },
}
