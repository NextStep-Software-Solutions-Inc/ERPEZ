import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { BacResolution, ProcurementSourceType } from '../types'
import api from '@/services/api'

export type WhereasClauses = {
  whereasClauseId: string
  order: number
}

export type CreateBacResolutionPayload = {
  sourceType?: 'APPItem' | 'ConsolidatedPR' | string
  appItemId?: string
  consolidatedPRId?: string
  title?: string
  abc?: number
  resolutionType?: string
  resolutionNumber?: string
  dateResolved?: string
  resolvedLocation?: string
  whereasClauses?: WhereasClauses[]
  endUserRepresentativeId?: string
  techRepresentativeId?: string
}

const endpoint = '/bac/projects'

export const createBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BacResolution>,
  undefined,
  CreateBacResolutionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<BacResolution>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
