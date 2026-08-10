/**
 * GET /consolidated-prs/{id}/eligible-prs
 * Returns approved PRs that can be added to the given Consolidated PR.
 * Used in the "Add PRs" modal on ConsolidatedPrDetailsPage.
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { EligiblePr } from '../types/apiTypes'

const endpoint = '/consolidated-prs/:id/eligible-prs' as const

export const getEligiblePrsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EligiblePr[]>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<APIResponse<EligiblePr[]>>(finalUrl)
    return response.data
  },
}
