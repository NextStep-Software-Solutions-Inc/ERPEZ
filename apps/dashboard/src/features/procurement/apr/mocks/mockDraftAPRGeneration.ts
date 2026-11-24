/**
 * Mock Draft APR Generation Helper
 * 
 * Transforms selected APP items into Draft APR items with:
 * - Category-based filtering of PSDBM catalog items
 * - Automatic item matching and variance tracking
 * - BAC milestones integration
 * - SPMS compliance tracking
 */

import type { ConsolidatedAPRItem } from '../types'
import type { BACLineItem } from '@/features/planning/app-consolidation/types'
import { mockAPRCatalogItems } from '../../psdbm/mocks/mockAPRItemsFromCatalog'

/**
 * Transform BAC line items from APP into Draft APR consolidated items
 * Links each APP item to the PSDBM catalog for procurement tracking
 * 
 * Flow:
 * 1. User selects APP (e.g., APP-001)
 * 2. User selects specific line items from BAC (e.g., Office Chairs, Desks, Laptops)
 * 3. This function converts them to APR items with PSDBM catalog linkage
 * 4. Items are automatically filtered by category
 */
export function transformAPPItemsToAPRItems(
  bacLineItems: BACLineItem[],
  appId: string,
  fiscalYear: number
): ConsolidatedAPRItem[] {
  return bacLineItems.map((bacItem, index) => {
    // Determine category from item description
    const itemCategory = determineCategoryFromDescription(bacItem.description)
    
    // Find matching PSDBM catalog items by category
    const psdbmMatches = filterPSDBMItemsByCategory(itemCategory)
    
    // Build consolidated APR item from BAC line item
    const aprItem: ConsolidatedAPRItem = {
      id: `APR-ITEM-${appId}-${index + 1}`,
      itemCode: `${bacItem.id}-SELECTED`,
      description: bacItem.description,
      unit: bacItem.unit,
      quantity: bacItem.quantity,
      unitCost: bacItem.unitCost,
      totalAmount: bacItem.totalAmount,
      office: bacItem.office || 'General',
      fundSource: (bacItem.allotmentClass ?? 'MOOE') === 'CO' ? 'Capital Outlay Fund' : 'Maintenance and Other Operating Expenses',
      ppmpId: '', // Would be linked in real system
      appId: appId,
      itemCategory: itemCategory,
      allotmentClass: bacItem.allotmentClass ?? 'MOOE',
      sourceFiscalYear: fiscalYear,
      sourceCategory: itemCategory,
      sourceMonth: new Date().toLocaleString('default', { month: 'long' }),
      
      // APP References (SPMS Compliance) ✅
      appLineItemId: bacItem.id,
      appBACId: 'bac-master', // Would be actual BAC document ID
      appApprovedQuantity: bacItem.quantity,
      appApprovedBudget: bacItem.totalAmount,
      
      // Variance Tracking (initially 0 - APR exactly matches APP)
      quantityVariance: 0,
      quantityVariancePercent: 0,
      budgetVariance: 0,
      budgetVariancePercent: 0,
      
      // Procurement Milestones from BAC
      bacMilestones: bacItem.milestones
        ? {
            advertisementDate: typeof bacItem.milestones.advertisementDate === 'string' ? bacItem.milestones.advertisementDate : undefined,
            submissionDate: typeof bacItem.milestones.submissionDate === 'string' ? bacItem.milestones.submissionDate : undefined,
            noticeOfAwardDate: typeof bacItem.milestones.noticeOfAwardDate === 'string' ? bacItem.milestones.noticeOfAwardDate : undefined,
            contractSigningDate: typeof bacItem.milestones.contractSigningDate === 'string' ? bacItem.milestones.contractSigningDate : undefined,
          }
        : undefined,
      
      // PSDBM Catalog Integration
      psdbmMatches: psdbmMatches.slice(0, 3), // Top 3 matching catalog items
    }
    
    return aprItem
  })
}

/**
 * Determine item category from description
 * Used to filter PSDBM catalog items appropriately
 */
function determineCategoryFromDescription(description: string): string {
  const desc = description.toLowerCase()
  
  if (desc.includes('chair') || desc.includes('desk') || desc.includes('furniture') || desc.includes('sofa') || desc.includes('table')) {
    return 'Furniture'
  }
  if (desc.includes('laptop') || desc.includes('computer') || desc.includes('printer') || desc.includes('keyboard') || desc.includes('mouse')) {
    return 'IT Equipment'
  }
  if (desc.includes('medical') || desc.includes('equipment') || desc.includes('reagent') || desc.includes('diagnostic')) {
    return 'Medical Supplies'
  }
  if (desc.includes('training') || desc.includes('seminar') || desc.includes('consulting') || desc.includes('service')) {
    return 'Services'
  }
  if (desc.includes('pen') || desc.includes('marker') || desc.includes('paper') || desc.includes('supplies')) {
    return 'Office Supplies'
  }
  
  return 'General Goods'
}

/**
 * Filter PSDBM catalog items by category
 * Returns available items that match the procurement category
 */
function filterPSDBMItemsByCategory(category: string) {
  const categoryKeywords: Record<string, string[]> = {
    'Office Supplies': ['pen', 'marker', 'paper', 'staple', 'clip', 'tape', 'ink'],
    'IT Equipment': ['keyboard', 'mouse', 'printer', 'monitor', 'cable', 'charger'],
    'Furniture': ['chair', 'desk', 'cabinet', 'shelf', 'sofa', 'table'],
    'Medical Supplies': ['marker', 'pen', 'tape', 'bandage', 'glove', 'mask'],
    'Services': [],
  }
  
  const keywords = categoryKeywords[category] || []
  
  return mockAPRCatalogItems.filter(psdbmItem => {
    const matchesKeyword = keywords.some(keyword =>
      psdbmItem.description.toLowerCase().includes(keyword)
    )
    const matchesAvailability = psdbmItem.availability === 'Available'
    return matchesKeyword && matchesAvailability
  })
}

/**
 * Create Draft APR payload from selected APP and items
 * Used when user completes APR creation workflow
 */
export interface DraftAPRPayload {
  appId: string
  selectedLineItemIds: string[]
  appLineItems: BACLineItem[]
  fiscalYear: number
  procuringEntity: string
}

export function generateDraftAPRFromApp(payload: DraftAPRPayload) {
  const now = new Date().toISOString()
  const aprNumber = `APR-${payload.fiscalYear}-${Date.now()}`
  
  const consolidatedItems = transformAPPItemsToAPRItems(
    payload.appLineItems,
    payload.appId,
    payload.fiscalYear
  )
  
  const totalAmount = consolidatedItems.reduce((sum, item) => sum + item.totalAmount, 0)
  
  return {
    id: `draft-apr-${payload.appId}-${Date.now()}`,
    aprNumber,
    agencyControlNumber: `DBM-${payload.fiscalYear}-DRAFT-${payload.appId}`,
    agencyAccountCode: '01-01-01-DRAFT',
    description: `Draft APR from ${payload.appId}`,
    requestDate: now,
    fiscalYear: payload.fiscalYear,
    status: 'DRAFT',
    procuringEntity: payload.procuringEntity,
    requestingEntity: 'Procurement Department',
    requestedBy: 'System Generated',
    requestedByPosition: 'APR Generator',
    header: {
      aprNumber,
      agencyControlNumber: `DBM-${payload.fiscalYear}-DRAFT-${payload.appId}`,
      agencyAccountCode: '01-01-01-DRAFT',
      description: `Draft APR from APP ${payload.appId}`,
      requestDate: now,
      fiscalYear: payload.fiscalYear,
      procuringEntity: payload.procuringEntity,
      requestingEntity: 'Procurement Department',
    },
    terms: {
      modeOfDelivery: 'SCHEDULED_PICKUP',
      insufficientFundsAction: 'REDUCE_QUANTITY',
      attachments: {
        observationReportRequired: false,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: true,
      },
      remarks: 'Auto-generated Draft APR from selected APP items',
    },
    consolidatedItems,
    totalItemsCount: consolidatedItems.length,
    totalAmount,
    createdBy: 'system@apr.gov.ph',
    createdAt: now,
    updatedAt: now,
  }
}
