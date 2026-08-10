import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { DimensionType } from '@/pages/planning/commitments/tabs/types'
import { OPCRDetails } from '../../opcr'

const endpoint = '/opcrs/items/:id/self-evaluate'

export interface PatchOPCRSelfEvaluatePayload {
  actualAccomplishment?: string
  justification?: string
  dimensionRate?: {
    fyActiveKPIMeasurementId: string
    dimension: DimensionType
    rating?: number
  }[]
  mov?: {
    fyActiveKPIMeasurementId: string
    mov?: string
    fileId?: string
  }[]
}

export const patchOPCRSelfEvaluateRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRDetails>,
  QueryParams,
  PatchOPCRSelfEvaluatePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<OPCRDetails>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
