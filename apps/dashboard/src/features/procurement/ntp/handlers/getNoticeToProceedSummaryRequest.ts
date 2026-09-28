/**
 * GET /notice-to-proceed/summary
 * Summary counts and metrics for Notice to Proceed dashboard.
 */

import type { APIResponse, QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import api from '@/services/api'
import type { NoticeToProceedSummary } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/summary' as const

export const getNoticeToProceedSummaryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<NoticeToProceedSummary>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<NoticeToProceedSummary>>(finalUrl, { signal })
    return response.data
  },
}
