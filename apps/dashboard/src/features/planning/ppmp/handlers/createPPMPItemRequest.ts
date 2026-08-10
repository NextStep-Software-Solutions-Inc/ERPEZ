import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UnitOfMeasurement } from '@/components/features/planning/procurement-library'
import { PPMPItem, ProcurementProjectType } from '../types'

const endpoint = '/ppmp-items'

export type CreatePPMPItemPayload = {
  ppmpExpenditureItemId: string
  cseItemId?: string
  nonCseItemId?: string
  procurementModeId: string
  papCode?: string
  name: string
  description?: string
  unit: string
  unitPrice: number
  mopOverride: boolean
  mopJustification?: string
  projectType?: ProcurementProjectType
  preProcurementConference?: boolean
  procurementStartDate?: string
  procurementEndDate?: string
  expectedDeliveryStart?: string
  expectedDeliveryEnd?: string
  remarks?: string
}

export const createPPMPItemRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPItem>,
  undefined,
  CreatePPMPItemPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PPMPItem>>(finalUrl, payload)
    return response.data
  },
}
