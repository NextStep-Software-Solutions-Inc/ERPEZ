/**
 * GET /purchase-requests/eligible-ppmps?officeId={officeId}
 * Returns PPMP documents (with their items) for a given office during new PR creation.
 * Used in AddItemsModal for Non-CSE PRs when no PR exists yet.
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { EligiblePpmpDocument } from '../types/apiTypes'

const endpoint = '/purchase-requests/eligible-ppmps' as const

export interface GetEligiblePpmpsByOfficeParams {
  officeId: string
}

export const getPurchaseRequestEligiblePpmpsByOfficeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EligiblePpmpDocument[]>,
  GetEligiblePpmpsByOfficeParams,
  QueryKey
> = {
  endpoint,
  key: ({ url, queryParams }) => [url, queryParams?.officeId] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<APIResponse<EligiblePpmpDocument[]>>(finalUrl)
    return response.data
  },
}
