import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { PPMPExpenditureItem } from '../types'

const endpoint = '/ppmp-expenditure-items/:id'

export type UpdatePPMPExpenditureItemPayload = {
  ppmpActivityId?: string
  isProcurable?: boolean
  totalCost?: number
  objectId?: string
}

export const updatePPMPExpenditureItemRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPExpenditureItem>,
  QueryParams,
  UpdatePPMPExpenditureItemPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PPMPExpenditureItem>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
