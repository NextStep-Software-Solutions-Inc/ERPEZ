/**
 * Submit APR for Review Request Handler
 * Mutation blueprint for submitting APR from DRAFT to FOR_APPROVAL (POST /aprs/:aprId/submit)
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { SubmitAPRPayload } from '../types'

const endpoint = '/aprs/:aprId/submit' as const

export const submitAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  SubmitAPRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    return response.data
  },
}
