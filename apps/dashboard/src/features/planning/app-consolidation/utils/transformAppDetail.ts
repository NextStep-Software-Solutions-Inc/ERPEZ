import type { AppDetailResponse, APPItemFromAPI, APPPPMPRelationFromAPI } from '../handlers/getAPPDetailRequest'
import type { AppMaster, APPAggregationResult, BACLineItem } from '../types'

/**
 * Transform API AppDetailResponse to AppMaster format
 * Maps API response fields to internal component structure
 * 
 * CRITICAL: Status values from API are capitalized (Draft, Submitted, Approved, Locked)
 * These must remain capitalized for conditional logic throughout the app to work correctly
 */
export function transformAppDetailToAppMaster(apiApp: AppDetailResponse): AppMaster {
  // Parse fiscal year from fiscalYearName (e.g., "2026" → 2026)
  const fiscalYear = parseInt(apiApp.fiscalYearName, 10)

  // Map API status to AppStatus (must stay capitalized: Draft, Submitted, Approved, Locked, Returned)
  const statusMap: Record<string, any> = {
    'Draft':     'Draft',
    'Submitted':  'Submitted',
    'Approved':   'Approved',
    'Locked':     'Locked',
    'Returned':   'Returned',
  }
  const status = (statusMap[apiApp.status] || 'Draft') as 'Draft' | 'Submitted' | 'Approved' | 'Locked'

  // Derive appType from the API field (Indicative | Final | Updated).
  // Do NOT infer from description text — that was unreliable.
  const appTypeMap: Record<string, 'Indicative' | 'Final' | 'Updated'> = {
    'Indicative': 'Indicative',
    'Final':      'Final',
    'Updated':    'Updated',
    // Legacy / alternate spellings
    'Supplemental': 'Final',
  }
  const appType = appTypeMap[apiApp.appType as string] ?? 'Indicative'

  // Parse API APPItems to internal BAC lineItems
  const lineItems: BACLineItem[] = apiApp.APPItems?.map((item: APPItemFromAPI) => {
    const quantity = item.quantity ?? 0
    const unitCost = item.unitCost ?? 0
    const totalAmount = item.totalAmount ?? (quantity * unitCost)

    const milestones = {
      advertisementDate: '',
      submissionDate: '',
      noticeOfAwardDate: '',
      contractSigningDate: '',
    }
    
    if (Array.isArray(item.schedules)) {
      item.schedules.forEach((sch: any) => {
        const name = (sch.procurementActivityTypeName || '').toUpperCase()
        const dateVal = sch.scheduledDate ? sch.scheduledDate.split('T')[0] : ''
        
        if (!dateVal) return

        if (name.includes('ADVERTISEMENT') || name.includes('POSTING') || name.includes('IAEB') || name.includes('IB/REI') || name.includes('PRE-PROCUREMENT') || name.includes('ADS')) {
          milestones.advertisementDate = dateVal
        } else if (name.includes('SUBMISSION') || name.includes('OPENING') || name.includes('BID')) {
          milestones.submissionDate = dateVal
        } else if (name.includes('NOTICE OF AWARD') || name.includes('AWARD') || name.includes('NOA')) {
          milestones.noticeOfAwardDate = dateVal
        } else if (name.includes('CONTRACT SIGNING') || name.includes('SIGNING')) {
          milestones.contractSigningDate = dateVal
        }
      })
    }

    return {
      id: item.id,
      ppmpItemId: item.ppmpItemId || undefined,
      code: item.code || item.ppmpItemId || item.id?.substring(0, 10) || '',
      description: item.ppmpItemName || item.description || '',
      unit: item.unit || 'unit',
      quantity,
      unitCost,
      totalAmount,
      modeOfProcurement: item.procurementModeName || item.modeOfProcurement || '',
      fundSource: item.fundSourceName || item.fundSource || '',
      itemCategory: item.itemCategory || '',
      office: item.officeName || item.office || '',
      allotmentClass: (item.allotmentClass as 'CO' | 'MOOE') || 'CO',
      schedules: item.schedules || [],
      eligibleForEPA: item.isEarlyProcurementActivity || false,
      remarks: item.remarks || '',
      epaRemarks: item.epaRemarks || '',
      startOfProcurementOverride: item.startOfProcurementOverride || '',
      endOfProcurementOverride: item.endOfProcurementOverride || '',
      effectiveStartOfProcurement: item.effectiveStartOfProcurement || '',
      effectiveEndOfProcurement: item.effectiveEndOfProcurement || '',
      isStartProcurementOverridden: item.isStartProcurementOverridden ?? !!item.startOfProcurementOverride,
      isEndProcurementOverridden: item.isEndProcurementOverridden ?? !!item.endOfProcurementOverride,
      isABCOverridden: item.isABCOverridden ?? (item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined),
      originalPPMPBudget: item.originalPPMPBudget ?? totalAmount,
      effectiveABC: item.effectiveABC ?? totalAmount,
      estimatedBudgetOverride: item.estimatedBudgetOverride !== undefined && item.estimatedBudgetOverride !== null ? item.estimatedBudgetOverride : null,
      isOutsourced: item.isOutsourced || false,
      procurementStrategies: (item.procurementStrategies as any[]) || [],
      bidEvaluationCriteria: (item.bidEvaluationCriteria as any) || undefined,
      milestones,
    }
  }) || []

  const totalBudget = lineItems.reduce((sum, item) => sum + item.totalAmount, 0)
  const sourceFunds = Array.from(new Set(lineItems.map((item) => item.fundSource).filter(Boolean)))
  const modeOfProcurements = Array.from(new Set(lineItems.map((item) => item.modeOfProcurement).filter(Boolean)))

  // Create empty aggregation results (to be populated from APPItems if available)
  const aggregationResults: APPAggregationResult = {
    items: [],
    totalAmount: totalBudget,
  }

  return {
    id: apiApp.id,
    ppmpIds: apiApp.APPPPMPs?.map((p: APPPPMPRelationFromAPI) => p.ppmpId || p.id || '') || [],
    appPpmps: apiApp.APPPPMPs || [],
    fiscalYear,
    fiscalYearId: apiApp.fiscalYearId,
    appName: apiApp.name,
    appCode: apiApp.appNumber,
    appNumber: apiApp.appNumber,
    appType,
    aggregationResults,
    bac: {
      id: `bac-${apiApp.id}`,
      appId: apiApp.id,
      lineItems,
      sourceFunds,
      totalBudget,
      modeOfProcurements,
    },
    signatories: {
      preparedBy: undefined,
      reviewedBy: undefined,
      approvedBy: undefined,
      certifiedBy: undefined,
    },
    status,
    createdAt: apiApp.createdAt,
    updatedAt: apiApp.updatedAt || apiApp.createdAt,
    createdBy: apiApp.createdBy || 'Unknown',
    description: apiApp.description,
    remarks: apiApp.remarks,
    isFinal: apiApp.isFinal,
    submittedDate: apiApp.submittedDate,
    approvedDate: apiApp.approvedDate,
    APPItems: apiApp.APPItems,
  } as AppMaster
}
