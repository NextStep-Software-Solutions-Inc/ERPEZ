/**
 * Mark Indicative APP as Final Request Handler
 * Transitions an Indicative APP from Draft to a Final (finalized) state
 * This marks the Indicative APP as ready for submission to DBM
 * The APP becomes the official annual procurement plan for the fiscal year
 *
 * Once marked as Final:
 * - APP type changes from 'Indicative' to 'Final'
 * - Cannot be reverted back to Indicative
 * - Can still be submitted for approval and edited if needed
 * - Serves as the baseline annual procurement plan
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AppMaster } from '../types'

const endpoint = '/app-consolidation/:appId/mark-as-final' as const

interface MarkAPPAsFinalPayload {
  appId: string
  remarks?: string
}

export const markAppAsFinalRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  MarkAPPAsFinalPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl: _finalUrl, payload }) => {
    // TODO: Replace client-side state mutation with markAppAsFinalRequest once backend endpoint is ready
    // const response = await api.post<APIResponse<AppMaster>>(_finalUrl, payload)
    // return response.data.data

    if (!payload) throw new Error('Payload is required')

    // MOCK DATA - simulate API response
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      // Return updated APP with appType changed to 'Final'
      id: payload.appId,
      ppmpIds: [],
      fiscalYear: 2024,
      appName: 'Final APP 2024',
      appCode: 'APP-2024-001',
      appNumber: 'APP-2024-001',
      appType: 'Final' as const,
      status: 'Draft' as const,
      aggregationResults: { items: [], totalAmount: 0 },
      bac: {
        id: '',
        appId: payload.appId,
        lineItems: [],
        sourceFunds: [],
        totalBudget: 0,
        modeOfProcurements: [],
      },
      signatories: {
        preparedBy: [],
        reviewedBy: [],
        approvedBy: [],
        certifiedBy: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      lockedAt: new Date().toISOString(),
      lockedBy: 'system',
    } as AppMaster
  },
}
