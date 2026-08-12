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
  mopOverride?: boolean
  mopJustification?: string
  projectType?: ProcurementProjectType
  preProcurementConference?: boolean
  procurementStartDate?: string
  procurementEndDate?: string
  expectedDeliveryStart?: string
  expectedDeliveryEnd?: string
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
