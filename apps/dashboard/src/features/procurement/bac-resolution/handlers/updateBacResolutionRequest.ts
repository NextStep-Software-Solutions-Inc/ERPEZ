import type { APIResponse, MutationBlueprintFromTemplate, QueryParams } from 'erpez-shared-lib'
import type { BacProject } from '../types'
import api from '@/services/api'

import type { WhereasClauses } from './createBacResolutionRequest'

const endpoint = '/bac/projects/:id'
export type UpdateBacProjectPayload = {
  title?: string
  status?: string
  resolutionType?: string
  resolutionNumber?: string
  dateResolved?: string
  resolvedLocation?: string
  whereasClauses?: WhereasClauses[]
  whereasClauseLinks?: { resolutionClauseId: string; order: number }[]
  nowThereforeClauses?: { resolutionClauseId: string; order: number }[]
  resolvedClauses?: { resolutionClauseId: string; order: number }[]
  appendAppItemIds?: string[]
  endUserRepresentativeId?: string
  techRepresentativeId?: string
}


export const updateBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BacProject>,
  QueryParams,
  UpdateBacProjectPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<BacProject>>(finalUrl, payload)
    return response.data
  },
}
