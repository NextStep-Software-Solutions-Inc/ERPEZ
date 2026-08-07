import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AppMaster } from '../types'

const endpoint = '/apps/:appId/set-final' as const

interface SetFinalAppPayload {
  appId: string
}

/**
 * Set APP as Final (Lock Mechanism)
 * Transitions from Approved → Locked state
 * This is IRREVERSIBLE - APP becomes immutable baseline for the fiscal year
 * Only HoPE can perform this action
 *
 * After locking:
 * - No more edits allowed to line items
 * - No deletion of items
 * - Serves as official baseline for the fiscal year
 * - Cannot be undone
 *
 * Audit log is maintained:
 * - lockedAt: timestamp
 * - lockedBy: user ID
 * - status: 'Locked'
 */
export const setFinalAppRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  SetFinalAppPayload
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
      appName: 'APP 2024 - FINAL',
      appCode: 'APP-2024-001',
      appNumber: 'APP-2024-001',
      appType: 'Indicative',
      status: 'Locked' as const,
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
      lockedAt: new Date().toISOString(),
      lockedBy: 'hope-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id',
    } as AppMaster
  },
}
