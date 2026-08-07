import type { AppMaster } from '../types'
import type { CreateAppFormValues } from './createAppSchema'

/**
 * Create a new APP object from form values
 * 
 * Initializes:
 * - Basic APP metadata (name, code, type, fiscal year)
 * - Empty BAC workspace
 * - Empty aggregation results
 * - Signatory placeholders
 */
export function createAppObject(values: CreateAppFormValues): AppMaster {
  const timestamp = Date.now()
  
  return {
    id: `APP-${timestamp}`,
    appCode: values.appCode,
    appName: values.appName,
    appNumber: values.appCode,
    appType: values.type,
    fiscalYear: values.fiscalYear,
    status: 'Draft',
    createdBy: 'Current User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bac: {
      id: `bac-${timestamp}`,
      appId: `APP-${timestamp}`,
      lineItems: [],
      totalBudget: 0,
      sourceFunds: [],
      modeOfProcurements: [],
    },
    ppmpIds: [],
    aggregationResults: {
      items: [],
      totalAmount: 0,
    },
    signatories: {
      preparedBy: [],
      reviewedBy: [],
      approvedBy: [],
      certifiedBy: [],
    },
  }
}
