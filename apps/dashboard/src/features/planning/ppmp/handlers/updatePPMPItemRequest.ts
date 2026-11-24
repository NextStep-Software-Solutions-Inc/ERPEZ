import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { PPMPItem, ProcurementProjectType } from '../types'

const endpoint = '/ppmp-items/:id'

export type UpdatePPMPItemPayload = {
  ppmpExpenditureItemId?: string
  cseItemId?: string
  nonCSEItemId?: string
  procurementModeId?: string
  papCode?: string
  name?: string
  description?: string
  unit?: string
  unitPrice?: number
  plannedQuantity?: number
  mopOverride?: boolean
  mopJustification?: string
  projectType?: ProcurementProjectType
  preProcurementConference?: boolean
  procurementStartDate?: string | null
  procurementEndDate?: string | null
  expectedDeliveryStart?: string | null
  expectedDeliveryEnd?: string | null
  remarks?: string
}

export const updatePPMPItemRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPItem>,
  QueryParams,
  UpdatePPMPItemPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PPMPItem>>(finalUrl, payload)
    return response.data
  },
}
