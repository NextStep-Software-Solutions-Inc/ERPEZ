import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { AppMaster, BACLineItem } from '../types'

const endpoint = '/apps/:appId/consolidate' as const

interface ConsolidatePPMPsPayload {
  appId: string
  ppmpIds: string[]
  fiscalYear: number
}

/**
 * Consolidate selected PPMPs into an APP
 * Backend handles aggregation, grouping, and lineage tracking
 *
 * Process:
 * 1. Fetch line items from all selected PPMPs
 * 2. Group identical items by Catalog Item ID
 * 3. Sum quantities and budgets (maintaining Total/MOOE/CO splits)
 * 4. Concatenate end-users/offices (e.g., "FAD, HR, IT")
 * 5. Return consolidated items with lineage data
 *
 * Response: APP with populated BAC line items
 */
export const consolidatePPMPsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  ConsolidatePPMPsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl: _finalUrl, payload }) => {
    // TODO: Replace with real API call when backend is ready
    // const response = await api.post<APIResponse<AppMaster>>(_finalUrl, payload)
    // return response.data.data

    // MOCK DATA for demonstration
    const mockConsolidatedItems: BACLineItem[] = [
      {
        id: 'item-1',
        description: 'Office Chairs',
        unit: 'pc',
        quantity: 150,
        unitCost: 3500,
        totalAmount: 525000,
        modeOfProcurement: 'Competitive Bidding',
        allotmentClass: 'CO',
        office: 'FAD, HR, IT',
        catalogItemId: 'CAT-001',
        schedules: [
          {
            id: 'sch-1',
            period: 'Q1-Q2',
            scheduledDate: '2024-06-30',
            quantity: 150,
          },
        ],
        milestones: {
          advertisementDate: '01/2024',
          submissionDate: '02/2024',
          noticeOfAwardDate: '03/2024',
          contractSigningDate: '03/2024',
        },
        remarks: 'Consolidated from 3 PPMPs (FAD-PPMP, HR-PPMP, IT-PPMP)',
        eligibleForEPA: true,
        originatingPPMPs: {
          'ppmp-fad': {
            itemId: 'item-fad-001',
            quantity: 50,
            totalAmount: 175000,
            office: 'Finance and Administrative Division',
          },
          'ppmp-hr': {
            itemId: 'item-hr-002',
            quantity: 50,
            totalAmount: 175000,
            office: 'Human Resources Division',
          },
          'ppmp-it': {
            itemId: 'item-it-003',
            quantity: 50,
            totalAmount: 175000,
            office: 'Information Technology Division',
          },
        },
      },
      {
        id: 'item-2',
        description: 'Laptops - Dell XPS 13',
        unit: 'pc',
        quantity: 25,
        unitCost: 45000,
        totalAmount: 1125000,
        modeOfProcurement: 'Competitive Bidding',
        allotmentClass: 'CO',
        office: 'IT, PMO',
        catalogItemId: 'CAT-002',
        schedules: [
          {
            id: 'sch-2',
            period: 'Q2',
            scheduledDate: '2024-06-30',
            quantity: 25,
          },
        ],
        milestones: {
          advertisementDate: '02/2024',
          submissionDate: '03/2024',
          noticeOfAwardDate: '04/2024',
          contractSigningDate: '04/2024',
        },
        remarks: 'High-performance units for IT and project management office',
        eligibleForEPA: false,
        originatingPPMPs: {
          'ppmp-it': {
            itemId: 'item-it-004',
            quantity: 15,
            totalAmount: 675000,
            office: 'IT Division',
          },
          'ppmp-pmo': {
            itemId: 'item-pmo-001',
            quantity: 10,
            totalAmount: 450000,
            office: 'Project Management Office',
          },
        },
      },
      {
        id: 'item-3',
        description: 'Office Supplies (Reams, Pens, etc.)',
        unit: 'lot',
        quantity: 10,
        unitCost: 5000,
        totalAmount: 50000,
        modeOfProcurement: 'Shopping',
        allotmentClass: 'MOOE',
        office: 'All Divisions',
        catalogItemId: 'CAT-003',
        schedules: [
          {
            id: 'sch-3',
            period: 'Monthly',
            scheduledDate: 'various dates',
            quantity: 10,
          },
        ],
        milestones: {
          advertisementDate: 'various dates',
          submissionDate: 'various dates',
          noticeOfAwardDate: 'various dates',
          contractSigningDate: 'as the need arises',
        },
        remarks: 'Recurring monthly procurement for office operations',
        eligibleForEPA: false,
        originatingPPMPs: {
          'ppmp-general': {
            itemId: 'item-gen-001',
            quantity: 10,
            totalAmount: 50000,
            office: 'General Services',
          },
        },
      },
    ]

    const totalBudget = mockConsolidatedItems.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    )

    const mockApp: AppMaster = {
      id: payload!.appId,
      ppmpIds: payload!.ppmpIds,
      fiscalYear: payload!.fiscalYear,
      appName: 'APP 2024',
      appCode: 'APP-2024-001',
      appNumber: 'APP-2024-001',
      appType: 'Indicative',
      status: 'Draft',
      aggregationResults: {
        items: mockConsolidatedItems.map((item) => ({
          unit: item.unit,
          items: [],
          totalQuantity: item.quantity,
          totalAmount: item.totalAmount,
        })),
        totalAmount: totalBudget,
      },
      bac: {
        id: `bac-${payload!.appId}`,
        appId: payload!.appId,
        lineItems: mockConsolidatedItems,
        sourceFunds: ['General Fund', 'Special Funds'],
        totalBudget: totalBudget,
        modeOfProcurements: [
          'Competitive Bidding',
          'Shopping',
        ],
      },
      signatories: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id',
    }

    return mockApp
  },
}
