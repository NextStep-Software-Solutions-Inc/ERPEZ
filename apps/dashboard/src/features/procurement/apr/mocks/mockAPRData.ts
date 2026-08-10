/**
 * Mock APR Data
 * 
 * Realistic mock data for APR list and details with APP integration fields
 * TODO: Replace with real API responses when backend is ready
 */

import { APRMaster, APRStatus, ModeOfDelivery, InsufficientFundsAction } from '../types'
import { mockAPPItems } from './mockAPPItems'
import { mockAPRCatalogItems } from '../../psdbm/mocks/mockAPRItemsFromCatalog'

/**
 * Helper: Create Draft APR Items from selected APP items with PSDBM catalog integration
 * Automatically filters PSDBM items by category and links to APP BAC items
 */
function createDraftAPRItemsFromAPP(appId: string, fiscalYear: number) {
  // Map APP-specific line items to categories for PSDBM filtering
  const appItemMappings: Record<string, { description: string; category: string; quantity: number; unitCost: number }[]> = {
    'app-001': [
      { description: 'Office Chairs (Executive)', category: 'Furniture', quantity: 15, unitCost: 8500 },
      { description: 'Office Desks (Standing)', category: 'Furniture', quantity: 20, unitCost: 12500 },
      { description: 'Laptops (Business Class)', category: 'IT Equipment', quantity: 10, unitCost: 65000 },
      { description: 'Network Printers', category: 'IT Equipment', quantity: 8, unitCost: 45000 },
    ],
    'app-002': [
      { description: 'Medical Supplies (Monthly)', category: 'Office Supplies', quantity: 12, unitCost: 75000 },
      { description: 'Medical Equipment', category: 'Medical Supplies', quantity: 5, unitCost: 150000 },
      { description: 'Laboratory Reagents', category: 'Office Supplies', quantity: 4, unitCost: 100000 },
    ],
    'app-003': [
      { description: 'Training Seminar - 3 days', category: 'Services', quantity: 2, unitCost: 180000 },
      { description: 'Consulting Services - System Integration', category: 'Services', quantity: 1, unitCost: 500000 },
    ],
  }
  
  const appItems = appItemMappings[appId] || []
  
  return appItems.map((item, idx) => {
    // Filter PSDBM catalog by category
    const categoryKeywords: Record<string, string[]> = {
      'Furniture': ['chair', 'desk', 'cabinet'],
      'IT Equipment': ['keyboard', 'mouse', 'printer', 'monitor'],
      'Office Supplies': ['pen', 'marker', 'paper', 'staple'],
      'Medical Supplies': ['marker', 'tape'],
      'Services': [],
    }
    
    const keywords = categoryKeywords[item.category] || []
    const psdbmMatches = mockAPRCatalogItems.filter(psdbm =>
      keywords.some(kw => psdbm.description.toLowerCase().includes(kw))
    )
    
    return {
      id: `APR-ITEM-${appId}-${idx + 1}`,
      itemCode: `${appId.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
      description: item.description,
      unit: 'unit',
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalAmount: item.quantity * item.unitCost,
      office: appId === 'app-001' ? 'Administration' : appId === 'app-002' ? 'Medical Division' : 'HR Division',
      fundSource: appId === 'app-001' ? 'General Fund' : 'General Fund',
      ppmpId: `PPMP-${fiscalYear}-001`,
      appId: appId,
      itemCategory: item.category,
      allotmentClass: 'MOOE' as const,
      sourceFiscalYear: fiscalYear,
      sourceCategory: item.category,
      sourceMonth: new Date().toLocaleString('default', { month: 'long' }),
      
      // APP References (SPMS Compliance)
      appLineItemId: `bac-${appId.split('-')[1]}-${String(idx + 1).padStart(3, '0')}`,
      appBACId: `bac-${appId}`,
      appApprovedQuantity: item.quantity,
      appApprovedBudget: item.quantity * item.unitCost,
      
      // Variance Tracking (0 when APR exactly matches APP)
      quantityVariance: 0,
      quantityVariancePercent: 0,
      budgetVariance: 0,
      budgetVariancePercent: 0,
      
      // Procurement Milestones from APP BAC
      bacMilestones: {
        advertisementDate: '2026-05-15',
        submissionDate: '2026-06-15',
        noticeOfAwardDate: '2026-07-15',
        contractSigningDate: '2026-08-15',
      },
      
      // PSDBM Catalog matches (top 3)
      psdbmMatches: psdbmMatches.slice(0, 3),
    }
  })
}

export const mockAPRList: APRMaster[] = [
  // ============================================
  // Draft APRs (generated from APP selection)
  // ============================================
  
  // Draft APR from APP-001 (Administrative Division)
  {
    id: 'APR-2026-DRAFT-001',
    aprNumber: 'APR-2026-DRAFT-ADM-001',
    agencyControlNumber: 'DBM-2026-DRAFT-ADM-001',
    agencyAccountCode: '01-01-01-DRAFT',
    description: 'Draft APR from APP-2026-ADM-001 (Office Equipment & Supplies)',
    requestDate: new Date('2026-03-25').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.DRAFT,
    procuringEntity: 'Procurement Division',
    requestingEntity: 'Administrative Services',
    requestedBy: 'System Generated',
    requestedByPosition: 'APR Creation Workflow',
    header: {
      aprNumber: 'APR-2026-DRAFT-ADM-001',
      agencyControlNumber: 'DBM-2026-DRAFT-ADM-001',
      agencyAccountCode: '01-01-01-DRAFT',
      description: 'Draft APR from APP-2026-ADM-001',
      requestDate: new Date('2026-03-25').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'Procurement Division',
      requestingEntity: 'Administrative Services',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.SCHEDULED_PICKUP,
      insufficientFundsAction: InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: false,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: true,
      },
      remarks: 'Auto-generated Draft APR from selected APP items - Ready for review and finalization',
    },
    consolidatedItems: createDraftAPRItemsFromAPP('app-001', 2026),
    totalItemsCount: 4,
    totalAmount: 1346000,
    createdBy: 'user@dbm.gov.ph',
    createdAt: new Date('2026-03-25').toISOString(),
    updatedAt: new Date('2026-03-25').toISOString(),
    sourceAPPId: 'app-001',
    appStatus: 'DRAFT' as const,
    appApprovedBudget: 1346000,
    appApprovedItemsCount: 4,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },

  {
    id: 'APR-2026-DRAFT-002',
    aprNumber: 'APR-2026-DRAFT-MED-001',
    agencyControlNumber: 'DBM-2026-DRAFT-MED-001',
    agencyAccountCode: '02-01-01-DRAFT',
    description: 'Draft APR from APP-2026-MED-001 (Medical Supplies & Equipment)',
    requestDate: new Date('2026-03-26').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.DRAFT,
    procuringEntity: 'Medical Procurement Division',
    requestingEntity: 'Hospital Services',
    requestedBy: 'System Generated',
    requestedByPosition: 'APR Creation Workflow',
    header: {
      aprNumber: 'APR-2026-DRAFT-MED-001',
      agencyControlNumber: 'DBM-2026-DRAFT-MED-001',
      agencyAccountCode: '02-01-01-DRAFT',
      description: 'Draft APR from APP-2026-MED-001',
      requestDate: new Date('2026-03-26').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'Medical Procurement Division',
      requestingEntity: 'Hospital Services',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.DOOR_TO_DOOR,
      insufficientFundsAction: InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: false,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: true,
      },
      remarks: 'Auto-generated Draft APR for medical procurement - Category-filtered items from PSDBM',
    },
    consolidatedItems: createDraftAPRItemsFromAPP('app-002', 2026),
    totalItemsCount: 3,
    totalAmount: 1300000,
    createdBy: 'user@doh.gov.ph',
    createdAt: new Date('2026-03-26').toISOString(),
    updatedAt: new Date('2026-03-26').toISOString(),
    sourceAPPId: 'app-002',
    appStatus: 'DRAFT' as const,
    appApprovedBudget: 1300000,
    appApprovedItemsCount: 3,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },

  {
    id: 'APR-2026-DRAFT-003',
    aprNumber: 'APR-2026-DRAFT-HRS-001',
    agencyControlNumber: 'DBM-2026-DRAFT-HRS-001',
    agencyAccountCode: '03-01-01-DRAFT',
    description: 'Draft APR from APP-2026-HRS-001 (Training & Consulting Services)',
    requestDate: new Date('2026-03-27').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.DRAFT,
    procuringEntity: 'HR Procurement Division',
    requestingEntity: 'HR Department',
    requestedBy: 'System Generated',
    requestedByPosition: 'APR Creation Workflow',
    header: {
      aprNumber: 'APR-2026-DRAFT-HRS-001',
      agencyControlNumber: 'DBM-2026-DRAFT-HRS-001',
      agencyAccountCode: '03-01-01-DRAFT',
      description: 'Draft APR from APP-2026-HRS-001',
      requestDate: new Date('2026-03-27').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'HR Procurement Division',
      requestingEntity: 'HR Department',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.FAST_LANE,
      insufficientFundsAction: InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: true,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: true,
      },
      remarks: 'Auto-generated Draft APR for services - Service items linked to APP line items',
    },
    consolidatedItems: createDraftAPRItemsFromAPP('app-003', 2026),
    totalItemsCount: 2,
    totalAmount: 860000,
    createdBy: 'user@hr.gov.ph',
    createdAt: new Date('2026-03-27').toISOString(),
    updatedAt: new Date('2026-03-27').toISOString(),
    sourceAPPId: 'app-003',
    appStatus: 'DRAFT' as const,
    appApprovedBudget: 860000,
    appApprovedItemsCount: 2,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },
  
  {
    id: 'APR-2026-001',
    aprNumber: 'APR-2026-001',
    agencyControlNumber: 'DBM-2026-0001',
    agencyAccountCode: '01-01-01-001',
    description: 'APR for office supplies and equipment procurement',
    requestDate: new Date('2026-01-15').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.APPROVED,
    procuringEntity: 'Procurement Division',
    requestingEntity: 'Administrative Services',
    requestedBy: 'Juan Dela Cruz',
    requestedByPosition: 'Procurement Officer',
    header: {
      aprNumber: 'APR-2026-001',
      agencyControlNumber: 'DBM-2026-0001',
      agencyAccountCode: '01-01-01-001',
      description: 'APR for office supplies and equipment procurement',
      requestDate: new Date('2026-01-15').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'Procurement Division',
      requestingEntity: 'Administrative Services',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.FAST_LANE,
      insufficientFundsAction: InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: true,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: true,
      },
      remarks: 'Approved for immediate procurement',
    },
    consolidatedItems: mockAPPItems.slice(0, 5),
    totalItemsCount: 5,
    totalAmount: mockAPPItems.slice(0, 5).reduce((sum, item) => sum + item.totalAmount, 0),
    createdBy: 'user@dbm.gov.ph',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2026-02-15').toISOString(),
    submittedAt: new Date('2026-02-01').toISOString(),
    approvedAt: new Date('2026-02-15').toISOString(),
    approvedBy: 'Maria Santos',
    sourceAPPId: 'app-001',
    appStatus: 'APPROVED' as const,
    appApprovedBudget: mockAPPItems.slice(0, 5).reduce((sum, item) => sum + item.totalAmount, 0),
    appApprovedItemsCount: 5,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },
  {
    id: 'APR-2026-002',
    aprNumber: 'APR-2026-002',
    agencyControlNumber: 'DEPED-2026-0001',
    agencyAccountCode: '02-01-01-001',
    description: 'APR for educational materials and infrastructure',
    requestDate: new Date('2026-02-20').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.FOR_APPROVAL,
    procuringEntity: 'Planning and Finance Division',
    requestingEntity: 'School Operations Department',
    requestedBy: 'Pedro Rodriguez',
    requestedByPosition: 'Chief Procurement Officer',
    header: {
      aprNumber: 'APR-2026-002',
      agencyControlNumber: 'DEPED-2026-0001',
      agencyAccountCode: '02-01-01-001',
      description: 'APR for educational materials and infrastructure',
      requestDate: new Date('2026-02-20').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'Planning and Finance Division',
      requestingEntity: 'School Operations Department',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.SCHEDULED_PICKUP,
      insufficientFundsAction: InsufficientFundsAction.BILL_US,
      attachments: {
        observationReportRequired: true,
        collectiveBarterAgreementRequired: true,
        completeSpecsRequired: true,
      },
      remarks: 'Pending review from Finance Committee',
    },
    consolidatedItems: mockAPPItems.slice(5, 9),
    totalItemsCount: 4,
    totalAmount: mockAPPItems.slice(5, 9).reduce((sum, item) => sum + item.totalAmount, 0),
    createdBy: 'user@deped.gov.ph',
    createdAt: new Date('2026-02-20').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString(),
    submittedAt: new Date('2026-03-05').toISOString(),
    sourceAPPId: 'app-002',
    appStatus: 'CONSOLIDATING' as const,
    appApprovedBudget: mockAPPItems.slice(5, 9).reduce((sum, item) => sum + item.totalAmount, 0),
    appApprovedItemsCount: 4,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },
  {
    id: 'APR-2026-003',
    aprNumber: 'APR-2026-003',
    agencyControlNumber: 'DOH-2026-0001',
    agencyAccountCode: '03-01-01-001',
    description: 'APR for medical supplies and equipment',
    requestDate: new Date('2026-03-10').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.DRAFT,
    procuringEntity: 'Procurement Department',
    requestingEntity: 'Hospital Services',
    requestedBy: 'Dr. Jose Reyes',
    requestedByPosition: 'Procurement Head',
    header: {
      aprNumber: 'APR-2026-003',
      agencyControlNumber: 'DOH-2026-0001',
      agencyAccountCode: '03-01-01-001',
      description: 'APR for medical supplies and equipment',
      requestDate: new Date('2026-03-10').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'Procurement Department',
      requestingEntity: 'Hospital Services',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.DOOR_TO_DOOR,
      insufficientFundsAction: InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: false,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: true,
      },
      remarks: 'Draft - Under review by departments',
    },
    consolidatedItems: mockAPPItems.slice(9, 13),
    totalItemsCount: 4,
    totalAmount: mockAPPItems.slice(9, 13).reduce((sum, item) => sum + item.totalAmount, 0),
    createdBy: 'user@doh.gov.ph',
    createdAt: new Date('2026-03-10').toISOString(),
    updatedAt: new Date('2026-03-12').toISOString(),
    sourceAPPId: 'app-002',
    appStatus: 'DRAFT' as const,
    appApprovedBudget: mockAPPItems.slice(9, 13).reduce((sum, item) => sum + item.totalAmount, 0),
    appApprovedItemsCount: 4,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },
  {
    id: 'APR-2026-004',
    aprNumber: 'APR-2026-004',
    agencyControlNumber: 'DILG-2026-0001',
    agencyAccountCode: '04-01-01-001',
    description: 'APR for office and maintenance supplies',
    requestDate: new Date('2026-01-30').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.RETURNED,
    procuringEntity: 'Administrative Department',
    requestingEntity: 'Operations Division',
    requestedBy: 'Angelica Garcia',
    requestedByPosition: 'Operations Manager',
    header: {
      aprNumber: 'APR-2026-004',
      agencyControlNumber: 'DILG-2026-0001',
      agencyAccountCode: '04-01-01-001',
      description: 'APR for office and maintenance supplies',
      requestDate: new Date('2026-01-30').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'Administrative Department',
      requestingEntity: 'Operations Division',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.FAST_LANE,
      insufficientFundsAction: InsufficientFundsAction.CHARGE_TO_DEPOSIT,
      attachments: {
        observationReportRequired: false,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: false,
      },
      remarks: 'Requires clarification on specifications',
    },
    consolidatedItems: mockAPPItems.slice(0, 3),
    totalItemsCount: 3,
    totalAmount: mockAPPItems.slice(0, 3).reduce((sum, item) => sum + item.totalAmount, 0),
    createdBy: 'user@dilg.gov.ph',
    createdAt: new Date('2026-01-30').toISOString(),
    updatedAt: new Date('2026-02-28').toISOString(),
    submittedAt: new Date('2026-02-10').toISOString(),
    returnedAt: new Date('2026-02-28').toISOString(),
    returnedBy: 'Ramon Lopez',
    returnRemarks: 'Requires clarification on specifications',
    sourceAPPId: 'app-001',
    appStatus: 'DRAFT' as const,
    appApprovedBudget: mockAPPItems.slice(0, 3).reduce((sum, item) => sum + item.totalAmount, 0),
    appApprovedItemsCount: 3,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },
  {
    id: 'APR-2026-005',
    aprNumber: 'APR-2026-005',
    agencyControlNumber: 'DTI-2026-0001',
    agencyAccountCode: '05-01-01-001',
    description: 'APR for machinery and equipment',
    requestDate: new Date('2026-02-05').toISOString(),
    fiscalYear: 2026,
    status: APRStatus.APPROVED,
    procuringEntity: 'Industrial Development Division',
    requestingEntity: 'Manufacturing Support Services',
    requestedBy: 'Roberto Fernandez',
    requestedByPosition: 'Equipment Manager',
    header: {
      aprNumber: 'APR-2026-005',
      agencyControlNumber: 'DTI-2026-0001',
      agencyAccountCode: '05-01-01-001',
      description: 'APR for machinery and equipment',
      requestDate: new Date('2026-02-05').toISOString(),
      fiscalYear: 2026,
      procuringEntity: 'Industrial Development Division',
      requestingEntity: 'Manufacturing Support Services',
    },
    terms: {
      modeOfDelivery: ModeOfDelivery.SCHEDULED_PICKUP,
      insufficientFundsAction: InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: true,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: true,
      },
      remarks: 'Approved - Ready for procurement execution',
    },
    consolidatedItems: mockAPPItems,
    totalItemsCount: mockAPPItems.length,
    totalAmount: mockAPPItems.reduce((sum, item) => sum + item.totalAmount, 0),
    createdBy: 'user@dti.gov.ph',
    createdAt: new Date('2026-02-05').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
    submittedAt: new Date('2026-02-15').toISOString(),
    approvedAt: new Date('2026-03-01').toISOString(),
    approvedBy: 'Cristina Tan',
    sourceAPPId: 'app-001',
    appStatus: 'APPROVED' as const,
    appApprovedBudget: mockAPPItems.reduce((sum, item) => sum + item.totalAmount, 0),
    appApprovedItemsCount: mockAPPItems.length,
    totalBudgetVariance: 0,
    totalBudgetVariancePercent: 0,
    appValidationStatus: 'VALID' as const,
  },
]

export const mockAPRDetail = (aprId: string): APRMaster | undefined => {
  // Handle both 2024 and 2026 prefixes for mock data
  if (aprId.includes('2024')) {
    const updatedId = aprId.replace('2024', '2026')
    return mockAPRList.find((apr) => apr.id === updatedId)
  }
  return mockAPRList.find((apr) => apr.id === aprId)
}

