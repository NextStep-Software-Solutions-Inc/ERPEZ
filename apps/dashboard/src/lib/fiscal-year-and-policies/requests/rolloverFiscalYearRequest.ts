import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/fiscal-years/:id/rollover'

export type RolloverFiscalYearPayload = {
  sourceFiscalYearId: string
  includeOrgStructure: boolean
  includeUACSLibrary: boolean
  includeRecurringExpenses: boolean
}

export type RolloverResultResponse = {
  fundSourcesCopied: number
  mfopapsCopied: number
  uacsCombinationsCopied: number
  uacsSegmentYearsCopied: number
  totalRecordsCopied: number
}

export const rolloverFiscalYearRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RolloverResultResponse>,
  { id: string },
  RolloverFiscalYearPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<RolloverResultResponse>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
