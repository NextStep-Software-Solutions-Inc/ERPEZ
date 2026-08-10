import type { AppMaster, PPMPVersion } from '../types'
import type { SupplementalMetadataFormValues } from '../forms/SupplementalAPPMetadataForm'
import { generateSupplementalMetadata } from '../handlers/deltaExtraction'

/**
 * Creates a complete supplemental APP object from selected PPMPs and metadata.
 * Handles delta extraction, BAC generation, and state initialization.
 * 
 * @param currentApp - Original APP
 * @param selectedVersions - Selected amended PPMP versions
 * @param deltaResult - Pre-extracted delta items and totals
 * @param metadata - Metadata form values (quarter, reference, etc.)
 * @param eligiblePPMPIds - Original PPMPs belonging to current APP
 * @returns Complete supplemental APP object ready for API or state management
 */
export function createSupplementalAppObject(
  currentApp: AppMaster,
  selectedVersions: PPMPVersion[],
  deltaResult: {
    deltaItems: any[]
    totalDeltaAmount: number
    amendedPPMPLabels: string[]
  },
  metadata: SupplementalMetadataFormValues,
  eligiblePPMPIds: string[]
) {
  const fiscalYear = currentApp.fiscalYear || new Date().getFullYear()
  const supplementalMetadata = generateSupplementalMetadata(currentApp, 1, fiscalYear)

  // Generate IDs once to ensure consistency across all references
  const timestamp = Date.now()
  const supplementalAppId = `app-supp-${timestamp}`
  const bacId = `bac-${timestamp}`

  // Identify amended vs. unamended PPMPs
  const amendedPPMPIds = selectedVersions.map((v) => v.ppmpId)
  const unamendedPPMPIds = eligiblePPMPIds.filter(
    (id) => !amendedPPMPIds.includes(id)
  )

  // Build BAC line items from delta items
  const bacLineItems = deltaResult.deltaItems.map((item) => ({
    id: item.id,
    code: item.code,
    description: item.description,
    unit: item.unit,
    quantity: item.deltaQuantity,
    unitCost: item.unitCost,
    totalAmount: item.deltaAmount,
    schedules: [],
    eligibleForEPA: false,
    modeOfProcurement: item.modeOfProcurement,
    fundSource: item.fundSource,
  }))

  // Build aggregation results
  const aggregationItems = deltaResult.deltaItems.map((item) => ({
    unit: item.unit,
    items: [
      {
        id: item.id,
        code: item.code,
        description: item.description,
        unit: item.unit,
        quantity: item.deltaQuantity,
        unitCost: item.unitCost,
        totalAmount: item.deltaAmount,
        modeOfProcurement: item.modeOfProcurement,
        fundSource: item.fundSource,
        itemCategory: item.itemCategory,
      },
    ],
    totalQuantity: item.deltaQuantity,
    totalAmount: item.deltaAmount,
  }))

  // Extract unique fund sources and modes of procurement
  const sourceFunds = [
    ...new Set(deltaResult.deltaItems.map((i) => i.fundSource)),
  ]
  const modeOfProcurements = [
    ...new Set(deltaResult.deltaItems.map((i) => i.modeOfProcurement)),
  ]

  return {
    id: supplementalAppId,
    ppmpIds: amendedPPMPIds,
    fiscalYear,
    appName: supplementalMetadata.supplementalName,
    appCode: supplementalMetadata.supplementalCode,
    appNumber: supplementalMetadata.supplementalCode,
    aggregationResults: {
      items: aggregationItems,
      totalAmount: deltaResult.totalDeltaAmount,
    },
    bac: {
      id: bacId,
      appId: supplementalAppId,
      lineItems: bacLineItems,
      sourceFunds: sourceFunds as any[],
      totalBudget: deltaResult.totalDeltaAmount,
      modeOfProcurements: modeOfProcurements as any[],
    },
    signatories: {},
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current-user',
    originalAppId: currentApp.id,
    supplementalNumber: 1,
    supplementalName: supplementalMetadata.supplementalName,
    deltaItems: deltaResult.deltaItems,
    reason: '',
    createdFromAmendedPPMPIds: amendedPPMPIds,
    unamendedPPMPIds: unamendedPPMPIds,
    amendedPPMPCount: amendedPPMPIds.length,
    unamendedPPMPCount: unamendedPPMPIds.length,
    // Include metadata from form
    quarter: metadata.quarter,
    referenceMemoNo: metadata.referenceMemoNo,
    approvalDocument: undefined, // TODO: Add document path if uploaded
  }
}
