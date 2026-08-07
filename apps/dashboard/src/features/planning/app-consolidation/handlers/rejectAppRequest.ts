import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AppMaster } from '../types'

const endpoint = '/apps/:appId/reject' as const

interface RejectAppPayload {
  appId: string
  reason: string
}

/**
 * Reject APP for approval
 * Transitions from Submitted → Draft state with rejection reason
 * Only HoPE can reject
 * Returns APP to Draft status for BAC_SECRETARIAT to revise
 */
export const rejectAppRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  RejectAppPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl: _finalUrl, payload }) => {
    // TODO: Replace with real API call when backend is ready
    // const response = await api.post<APIResponse<AppMaster>>(_finalUrl, payload)
    // return response.data.data

    // MOCK DATA
    return {
      id: payload!.appId,
      ppmpIds: [],
      fiscalYear: 2024,
      appName: 'APP 2024',
      appCode: 'APP-2024-001',
      appNumber: 'APP-2024-001',
      appType: 'Indicative',
      status: 'Draft' as const,
      aggregationResults: { items: [], totalAmount: 0 },
      bac: {
        id: '',
        appId: payload!.appId,
        lineItems: [],
        sourceFunds: [],
        totalBudget: 0,
        modeOfProcurements: [],
      },
      signatories: {},
      rejectionReason: payload!.reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'hope-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id',
    } as AppMaster
  },
}
