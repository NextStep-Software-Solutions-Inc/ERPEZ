import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AppMaster, BACLineItem } from '../types'

const endpoint = '/apps/:appId/bac/update-items' as const

interface UpdateBACItemsPayload {
  appId: string
  items: Partial<BACLineItem>[]
}

/**
 * Batch Update BAC Line Items
 * Allows BAC_SECRETARIAT to update multiple line items in one request
 * Supports updates to:
 * - Mode of Procurement (MoP)
 * - Bidding Schedule (4 milestone dates)
 * - Remarks
 * - EPA Eligibility flag
 *
 * Validation:
 * - Cannot edit locked columns (code, description, office, quantity, budget)
 * - Cannot update if APP status is 'Locked'
 * - Tracks lastModifiedBy and lastModifiedAt
 */
export const updateBACItemsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  UpdateBACItemsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl: _finalUrl, payload }) => {
    // TODO: Replace with real API call when backend is ready
    // const response = await api.post<APIResponse<AppMaster>>(_finalUrl, payload)
    // return response.data.data

    // MOCK DATA - Returns updated APP
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
        id: `bac-${payload!.appId}`,
        appId: payload!.appId,
        lineItems: payload!.items.map(
          (item) =>
            ({
              ...item,
              lastModifiedBy: 'current-user-id',
              lastModifiedAt: new Date().toISOString(),
              unsavedChanges: false,
            }) as BACLineItem,
        ),
        sourceFunds: [],
        totalBudget: 0,
        modeOfProcurements: [],
      },
      signatories: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id',
    } as AppMaster
  },
}
