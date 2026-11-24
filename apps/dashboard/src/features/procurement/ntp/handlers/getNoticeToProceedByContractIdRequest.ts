/**
 * GET /notice-to-proceed/by-contract/{contractId}
 * Retrieve detailed Notice to Proceed by Contract ID.
 */

import type { APIResponse, QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import api from '@/services/api'
import type { NoticeToProceedDetail } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/by-contract/:contractId' as const

export const getNoticeToProceedByContractIdRequest: QueryBlueprintFromTemplate<
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
