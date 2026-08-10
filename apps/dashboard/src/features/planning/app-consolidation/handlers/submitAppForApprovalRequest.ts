import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AppMaster } from '../types'

const endpoint = '/apps/:appId/submit' as const

interface SubmitAppPayload {
  appId: string
}

/**
 * Submit APP for approval
 * Transitions from Draft → Submitted state
 * Only BAC_SECRETARIAT can submit
 */
export const submitAppForApprovalRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  SubmitAppPayload
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
      status: 'Submitted' as const,
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
      submittedAt: new Date().toISOString(),
      submittedBy: 'current-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id',
    } as AppMaster
  },
}
