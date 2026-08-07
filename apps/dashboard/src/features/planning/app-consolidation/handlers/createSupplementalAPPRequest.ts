import type { SupplementalAPP } from '../types'

/**
 * Payload for creating a Supplemental APP
 * Matches the backend API expectations
 */
export interface CreateSupplementalAPPPayload {
  originalAppId: string
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  referenceMemoNo?: string
  approvalDocumentPath?: string // Path returned from document upload
  deltaItems: Array<{
    code: string
    description: string
    unit: string
    quantity: number
    unitCost: number
    modeOfProcurement: string
    fundSource: string
    itemCategory: string
  }>
}

/**
 * Request handler blueprint for creating a Supplemental APP
 * Follows the factory pattern from erpez-shared-lib
 * 
 * Usage:
 * const useCreateSupplementalAPP = createMutationHookFromTemplate(createSupplementalAPPRequest)
 * 
 * See: documentations/supplemental-app-creation.md
 */
export const createSupplementalAPPRequest = {
  endpoint: '/v1/apps/supplemental',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({ finalUrl, payload }: { finalUrl: string; payload: CreateSupplementalAPPPayload }) => {
    // Mock implementation - returns structured supplemental APP
    // In production, this will be replaced with actual API call via:
    // const api = useAPI() // from erpez-shared-lib
    // const response = await api.post(finalUrl, payload)
    
    const mockResponse: SupplementalAPP = {
      id: `app-supp-${Date.now()}`,
      ppmpIds: [],
      fiscalYear: new Date().getFullYear(),
      appName: `Supplemental APP - ${payload.quarter}`,
      appCode: `APP-SUPP-${Date.now().toString().slice(-6)}`,
      appNumber: `APP-SUPP-${Date.now().toString().slice(-6)}`,
      appType: 'Supplemental',
      status: 'Draft',
      aggregationResults: {
        items: [],
        totalAmount: 0,
      },
      bac: {
        id: `bac-${Date.now()}`,
        appId: `app-supp-${Date.now()}`,
        lineItems: [],
        sourceFunds: [],
        modeOfProcurements: [],
        totalBudget: 0,
      },
      signatories: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      originalAppId: payload.originalAppId,
      supplementalNumber: 1,
      supplementalName: `Supplemental Annual Procurement Plan No. 1 for FY ${new Date().getFullYear()}`,
      deltaItems: [],
      reason: '',
      quarter: payload.quarter,
      referenceMemoNo: payload.referenceMemoNo,
      approvalDocument: payload.approvalDocumentPath
        ? {
            name: 'approval-document',
            path: payload.approvalDocumentPath,
            uploadedAt: new Date().toISOString(),
          }
        : undefined,
    }

    return { data: mockResponse }
  },
}
