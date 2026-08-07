/**
 * Mock Data Factory
 * Generates realistic PPMP test data for all states and scenarios
 */

import {
  PPMP,
  PPMPState,
  PPMPActivityBlock,
  PPMPIoEBlock,
  PPMPLineItem,
  ApprovalRole,
  Month,
  ALL_MONTHS,
  createEmptyMonthlyQuantities,
  ModeOfProcurement,
} from '../types'

/**
 * Generate mock monthly quantities
 */
function generateMockMonthlyQuantities(
  total: number,
  distribution: 'even' | 'front-loaded' | 'back-loaded' = 'even',
): Record<Month, number> {
  const quantities = createEmptyMonthlyQuantities()

  if (distribution === 'even') {
    const perMonth = Math.floor(total / 12)
    const remainder = total % 12
    ALL_MONTHS.forEach((month, index) => {
      quantities[month] = perMonth + (index < remainder ? 1 : 0)
    })
  } else if (distribution === 'front-loaded') {
    const perMonth = Math.floor(total / 6)
    const remainder = total % 6
    ALL_MONTHS.slice(0, 6).forEach((month, index) => {
      quantities[month] = perMonth + (index < remainder ? 1 : 0)
    })
  } else if (distribution === 'back-loaded') {
    const perMonth = Math.floor(total / 6)
    const remainder = total % 6
    ALL_MONTHS.slice(6, 12).forEach((month, index) => {
      quantities[month] = perMonth + (index < remainder ? 1 : 0)
    })
  }

  return quantities
}

/**
 * Generate mock line items for an IoE block
 */
function generateMockLineItems(
  count: number = 2,
  config?: {
    overBudget?: boolean
    unitPrice?: number
  },
): PPMPLineItem[] {
  return Array.from({ length: count }, (_, i) => {
    const unitPrice = config?.unitPrice || 10000 + i * 1000
    const totalQuantity = 5 + i
    const estimatedBudget = totalQuantity * unitPrice

    return {
      id: `line-item-${i + 1}`,
      catalogItemId: `catalog-item-${i + 1}`,
      itemName: `Item ${String.fromCharCode(65 + i)}: Equipment/Service`,
      unitOfMeasure: 'unit',
      unitPrice,
      originDepartmentId: null,
      originDepartmentName: null,
      monthlyQuantities: generateMockMonthlyQuantities(totalQuantity, 'even'),
      totalQuantity,
      estimatedBudget,
      suggestedMoP: 'Public Bidding' as ModeOfProcurement,
      mopOverride: null,
      mopJustification: '',
      ioEBlockId: `ioe-block-${i}`,
      sortOrder: i,
      marketScopingId: null,
      marketScopingRef: null,
      marketScopingCostEstimate: null,
      projectType: 'Goods',
      sizeSpecification: null,
      preProcurementConference: false,
      procurementStart: null,
      procurementEnd: null,
      expectedDelivery: null,
      remarks: null,
      attachments: null,
    }
  })
}

/**
 * Generate mock IoE blocks for an activity
 */
function generateMockIoEBlocks(
  count: number = 2,
  config?: {
    overBudget?: boolean
  },
): PPMPIoEBlock[] {
  return Array.from({ length: count }, (_, i) => {
    const items = generateMockLineItems(2, config)
    const totalCost = items.reduce((sum, item) => sum + item.estimatedBudget, 0)
    const budgetLimit = config?.overBudget ? totalCost * 0.8 : totalCost * 1.2

    return {
      id: `ioe-block-${i}`,
      ioEId: `ioe-${i}`,
      ioEName: `Item of Expenditure ${i + 1}`,
      ioECode: `IOE-${String(i + 1).padStart(3, '0')}`,
      budgetLimit,
      activityBlockId: `activity-${0}`,
      items,
      totalCost,
      isOverBudget: totalCost > budgetLimit,
      isProcurable: true,
    }
  })
}

/**
 * Generate mock activity blocks
 */
function generateMockActivityBlocks(
  count: number = 3,
  config?: {
    overBudget?: boolean
  },
): PPMPActivityBlock[] {
  return Array.from({ length: count }, (_, i) => {
    const ioEBlocks = generateMockIoEBlocks(2, config)
    const totalCost = ioEBlocks.reduce((sum, block) => sum + block.totalCost, 0)

    return {
      id: `activity-${i}`,
      activityId: `activity-${i}`,
      activityName: `Activity ${i + 1}: ${['Development', 'Implementation', 'Monitoring'][i] || 'Management'}`,
      activityCode: `ACT-${String(i + 1).padStart(3, '0')}`,
      ioEBlocks,
      totalCost,
    }
  })
}

/**
 * Generate mock PPMP for any state
 */
export function generateMockPpmp(
  state: PPMPState = PPMPState.DRAFT,
  overrides?: Partial<PPMP> & { overBudget?: boolean; activityCount?: number },
): PPMP {
  const activityBlocks = generateMockActivityBlocks(
    overrides?.activityCount || 3,
    {
      overBudget: overrides?.overBudget,
    },
  )
  const totalBudget = activityBlocks.reduce(
    (sum, block) => sum + block.totalCost,
    0,
  )

  const baseData: PPMP = {
    id: 'ppmp-' + Math.random().toString(36).substr(2, 9),
    documentName: 'FY2026 Department Operations PPMP',
    ppmpNumber: 'FY2026-DAO-001',
    fiscalYear: 2026,
    libId: 'lib-dao-2026',
    libName: 'Department of Agriculture Operations Library',
    isMasterOffice: false,
    officeId: 'office-dao',
    consolidatedToMasterId: null,
    state,
    activityBlocks,
    totalBudget,
    approvalHistory: [],
    currentApprovalStage:
      state === PPMPState.PENDING_REVIEW ? ApprovalRole.BUDGET_OFFICER : null,
    parentPpmpId: null,
    amendmentVersion: 1,
    rejectionReason:
      state === PPMPState.REJECTED
        ? 'Budget allocation exceeds approved limit. Please revise activity costs.'
        : null,
    createdBy: 'user-123',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
  }

  return {
    ...baseData,
    ...overrides,
  }
}

/**
 * Generate mock PPMP for all states
 */
export function generateMockPpmpForAllStates(): Record<PPMPState, PPMP> {
  return {
    [PPMPState.DRAFT]: generateMockPpmp(PPMPState.DRAFT),
    [PPMPState.REJECTED]: generateMockPpmp(PPMPState.REJECTED, {
      rejectionReason:
        'Budget allocation exceeds approved limit. Please revise activity costs.',
    }),
    [PPMPState.AMENDING]: generateMockPpmp(PPMPState.AMENDING, {
      amendmentVersion: 2,
    }),
    [PPMPState.PENDING_REVIEW]: generateMockPpmp(PPMPState.PENDING_REVIEW, {
      currentApprovalStage: ApprovalRole.BUDGET_OFFICER,
    }),
    [PPMPState.APPROVED]: generateMockPpmp(PPMPState.APPROVED, {
      currentApprovalStage: null,
    }),
    [PPMPState.CONSOLIDATED]: generateMockPpmp(PPMPState.CONSOLIDATED, {
      consolidatedToMasterId: 'master-ppmp-001',
    }),
    [PPMPState.SUPERSEDED]: generateMockPpmp(PPMPState.SUPERSEDED),
  }
}

/**
 * Over-budget scenario
 */
export function createOverBudgetScenario(): PPMP {
  return generateMockPpmp(PPMPState.DRAFT, { overBudget: true })
}
