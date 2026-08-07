import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AppMaster, AppApprovalFormValues } from '../types'

const endpoint = '/apps/:appId/approve' as const

interface ApproveAppPayload extends AppApprovalFormValues {
  appId: string
}

/**
 * Approve APP
 * Transitions from Submitted → Approved state
 * Only HoPE (Head of Procuring Entity) can approve
 * Can optionally set as Final APP (Locked) during approval
 */
export const approveAppRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  ApproveAppPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl: _finalUrl, payload }) => {
    // TODO: Replace with real API call when backend is ready
    // const response = await api.post<APIResponse<AppMaster>>(_finalUrl, payload)
    // return response.data.data

    // MOCK DATA
    const status = payload!.setAsFinal ? ('Locked' as const) : ('Approved' as const)

    return {
      id: payload!.appId,
      ppmpIds: [],
      fiscalYear: 2024,
      appName: 'APP 2024',
      appCode: 'APP-2024-001',
      appNumber: 'APP-2024-001',
      appType: 'Indicative',
      status,
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
      approvedAt: new Date().toISOString(),
      approvedBy: 'hope-user-id',
      lockedAt: payload!.setAsFinal ? new Date().toISOString() : undefined,
      lockedBy: payload!.setAsFinal ? 'hope-user-id' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id',
    } as AppMaster
  },
}
