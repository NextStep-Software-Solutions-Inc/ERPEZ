import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { PPMPExpenditureItem } from '../types'

const endpoint = '/ppmp-expenditure-items'

export type CreatePPMPExpenditureItemPayload = {
  ppmpActivityId: string
  isProcurable: boolean
}

export const createPPMPExpenditureItemRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPExpenditureItem>,
  undefined,
  CreatePPMPExpenditureItemPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PPMPExpenditureItem>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
