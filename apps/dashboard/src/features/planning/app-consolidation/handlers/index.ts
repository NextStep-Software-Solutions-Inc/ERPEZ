import type { PPMPItem, BACLineItem } from '../types'
import { getMockPPMPsByPPMPId } from '../__mocks__/ppmpMocks'
import { generateMockMilestones } from '../utils/generateMilestones'

// ============================================================================
// BAC LINE ITEM CONVERSION UTILITIES
// ============================================================================

/**
 * Convert PPMP items to BAC line items with proper typing
 * Ensures all BAC details are populated from source PPMPs
 */
export function convertPPMPItemsToBACLineItems(ppmpItems: PPMPItem[]): BACLineItem[] {
  return ppmpItems.map((item, idx) => ({
    id: `bac-${item.id}`,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    unitCost: item.unitCost,
    totalAmount: item.totalAmount,
    modeOfProcurement: item.modeOfProcurement,
    allotmentClass: item.allotmentClass || 'CO',
    office: item.office,
    fundSource: item.fundSource || 'General Fund',
    milestones: generateMockMilestones(item.modeOfProcurement),
    schedules: [
      {
        id: `sch-${idx + 1}`,
        period: 'Full Year',
        scheduledDate: new Date().toISOString().split('T')[0],
        quantity: item.quantity,
      },
    ],
    remarks: `Populated from PPMP ${item.code}`,
    eligibleForEPA: true,
  }))
}

/**
 * Consolidate items from multiple PPMPs into BAC line items
 * Merges similar items (same code/description) with offices aggregated
 * 
 * @param ppmpIds - Array of PPMP IDs to consolidate
 * @returns Array of consolidated BAC line items
 * @throws Error if PPMP ID not found
 */
export function consolidatePPMPItemsForBAC(ppmpIds: string[]): BACLineItem[] {
  const itemMap = new Map<string, BACLineItem & { offices: string[]; ppmpSourceIds: string[] }>()
  
  // Collect all items from all PPMPs
  ppmpIds.forEach((ppmpId) => {
    const items = getMockPPMPsByPPMPId(ppmpId)
    
    if (!items || items.length === 0) {
      return
    }
    
    items.forEach((item: PPMPItem) => {
      const key = `${item.code}|${item.description}` // Group by code + description
      
      if (!itemMap.has(key)) {
        // First occurrence of this item
        itemMap.set(key, {
          id: `bac-${item.id}`,
          code: item.code,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalAmount: item.totalAmount,
          modeOfProcurement: item.modeOfProcurement,
          allotmentClass: item.allotmentClass || 'CO',
          office: item.office || '',
          fundSource: item.fundSource || 'General Fund',
          schedules: [
            {
              id: `sch-1`,
              period: 'Full Year',
              scheduledDate: new Date().toISOString().split('T')[0],
              quantity: item.quantity,
            },
          ],
          remarks: `Consolidated from PPMP(s): ${item.code}`,
          eligibleForEPA: true,
          milestones: {
            advertisementDate: '',
            submissionDate: '',
            noticeOfAwardDate: '',
            contractSigningDate: '',
          },
          offices: item.office ? [item.office] : [],
          ppmpSourceIds: [ppmpId],
        })
      } else {
        // Merge with existing item
        const existing = itemMap.get(key)!
        existing.quantity += item.quantity
        existing.totalAmount += item.totalAmount
        
        // Add office if not already present
        if (item.office && !existing.offices.includes(item.office)) {
          existing.offices.push(item.office)
        }
        
        // Track source PPMPs
        if (!existing.ppmpSourceIds.includes(ppmpId)) {
          existing.ppmpSourceIds.push(ppmpId)
        }
      }
    })
  })
  
  // Convert map to array and format office as comma-separated string
  const result = Array.from(itemMap.values()).map((item) => ({
    ...item,
    office: item.offices.sort().join(', '),
    // Remove temporary fields used for consolidation
    offices: undefined,
    ppmpSourceIds: undefined,
  } as BACLineItem))
  
  return result
}

/**
 * Calculate total budget from BAC line items
 */
export function calculateTotalBudgetFromLineItems(lineItems: BACLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
}

/**
 * Extract unique source funds from line items
 */
export function extractSourceFundsFromLineItems(lineItems: BACLineItem[]): string[] {
  const funds = new Set<string>()
  lineItems.forEach((item) => {
    // Extract unique funding sources from line items
    if (item.fundSource) {
      funds.add(item.fundSource)
    }
  })
  return Array.from(funds).sort()
}

/**
 * Extract unique modes of procurement from line items
 */
export function extractModesOfProcurementFromLineItems(lineItems: BACLineItem[]): string[] {
  const modes = new Set<string>()
  lineItems.forEach((item) => {
    if (item.modeOfProcurement) {
      modes.add(item.modeOfProcurement)
    }
  })
  return Array.from(modes).sort()
}

/**
 * Create BAC object with properly calculated fields from lineItems
 */
export function createBACFromLineItems(appId: string, lineItems: BACLineItem[]) {
  return {
    id: `bac-${Date.now()}`,
    appId,
    lineItems,
    sourceFunds: extractSourceFundsFromLineItems(lineItems),
    totalBudget: calculateTotalBudgetFromLineItems(lineItems),
    modeOfProcurements: extractModesOfProcurementFromLineItems(lineItems),
  }
}

export const MOCK_PPMP_DATA = {
  id: 'ppmp-2024-001',
  fiscalYear: 2024,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1,
  items: [
    {
      id: 'item-001',
      code: 'MED-2024-001',
      description: 'Hospital Beds',
      unit: 'unit',
      quantity: 50,
      unitCost: 15000,
      totalAmount: 750000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Hospital Operations',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'MED-2024-002',
      description: 'ECG Machines',
      unit: 'unit',
      quantity: 10,
      unitCost: 500000,
      totalAmount: 5000000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'Special Equipment Fund',
      itemCategory: 'Medical Equipment',
      office: 'Cardiology Department',
      allotmentClass: 'CO',
    },
    {
      id: 'item-003',
      code: 'SUP-2024-001',
      description: 'Medical Supplies Kit',
      unit: 'pack',
      quantity: 1000,
      unitCost: 5000,
      totalAmount: 5000000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Supplies',
      office: 'Hospital Supply Chain',
      allotmentClass: 'MOOE',
    },
    {
      id: 'item-004',
      code: 'OFF-2024-001',
      description: 'Office Furniture Set',
      unit: 'set',
      quantity: 20,
      unitCost: 25000,
      totalAmount: 500000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Office Equipment',
      office: 'Administrative Division',
      allotmentClass: 'CO',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Base PPMP Data - 2024-002 (Office & Support Services)
export const MOCK_PPMP_DATA_002 = {
  id: 'ppmp-2024-002',
  fiscalYear: 2024,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1,
  items: [
    {
      id: 'item-001',
      code: 'OFF-2024-001',
      description: 'Office Furniture Set',
      unit: 'set',
      quantity: 20,
      unitCost: 25000,
      totalAmount: 500000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Office Equipment',
      office: 'Administrative Division',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'OFF-2024-002',
      description: 'Desktop Computers',
      unit: 'unit',
      quantity: 30,
      unitCost: 125000,
      totalAmount: 3750000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Office Equipment',
      office: 'Administrative Division',
      allotmentClass: 'CO',
    },
    {
      id: 'item-003',
      code: 'OFF-2024-003',
      description: 'HVAC System Maintenance',
      unit: 'service',
      quantity: 2,
      unitCost: 800000,
      totalAmount: 1600000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Services',
      office: 'Facilities Management',
      allotmentClass: 'MOOE',
    },
    {
      id: 'item-004',
      code: 'SUP-2024-002',
      description: 'Office Supplies (Annual)',
      unit: 'package',
      quantity: 12,
      unitCost: 150000,
      totalAmount: 1800000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Supplies',
      office: 'Administrative Division',
      allotmentClass: 'MOOE',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Base PPMP Data - 2024-003 (Support Services & Maintenance)
export const MOCK_PPMP_DATA_003 = {
  id: 'ppmp-2024-003',
  fiscalYear: 2024,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1,
  items: [
    {
      id: 'item-001',
      code: 'MED-2024-001',
      description: 'Hospital Beds',
      unit: 'unit',
      quantity: 50,
      unitCost: 15000,
      totalAmount: 750000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Hospital Operations',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'SUP-2024-001',
      description: 'Medical Supplies Kit',
      unit: 'pack',
      quantity: 1000,
      unitCost: 5000,
      totalAmount: 5000000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Supplies',
      office: 'Hospital Supply Chain',
      allotmentClass: 'MOOE',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Base PPMP Data - 2024-004 (Medical Equipment)
export const MOCK_PPMP_DATA_004 = {
  id: 'ppmp-2024-004',
  fiscalYear: 2024,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1,
  items: [
    {
      id: 'item-001',
      code: 'MED-2024-002',
      description: 'Ultrasound Machines',
      unit: 'unit',
      quantity: 3,
      unitCost: 500000,
      totalAmount: 1500000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Radiology Department',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'MED-2024-003',
      description: 'X-Ray Equipment',
      unit: 'unit',
      quantity: 2,
      unitCost: 300000,
      totalAmount: 600000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Radiology Department',
      allotmentClass: 'CO',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Base PPMP Data - 2025-001 (Advanced Imaging Equipment)
export const MOCK_PPMP_DATA_005 = {
  id: 'ppmp-2025-001',
  fiscalYear: 2025,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1,
  items: [
    {
      id: 'item-001',
      code: 'MED-2025-001',
      description: 'CT Scanner',
      unit: 'unit',
      quantity: 1,
      unitCost: 5000000,
      totalAmount: 5000000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Imaging Services Division',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'MED-2025-002',
      description: 'MRI Machine',
      unit: 'unit',
      quantity: 1,
      unitCost: 3900000,
      totalAmount: 3900000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Imaging Services Division',
      allotmentClass: 'CO',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Amended PPMP v1.1 - Hospital focus with increased quantities and new items
// Amended PPMP v1.1 - Hospital Focus with Medical Equipment additions
export const MOCK_PPMP_AMENDED_V1 = {
  id: 'ppmp-2024-001-v1.1',
  fiscalYear: 2024,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1.1,
  baselineVersion: 1,
  isAmendment: true,
  amendmentOf: 'ppmp-2024-001',
  items: [
    {
      id: 'item-001',
      code: 'MED-2024-001',
      description: 'Hospital Beds',
      unit: 'unit',
      quantity: 75, // Increased from 50 (+25 delta)
      unitCost: 15000,
      totalAmount: 1125000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Hospital Operations',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'MED-2024-002',
      description: 'ECG Machines',
      unit: 'unit',
      quantity: 10,
      unitCost: 500000,
      totalAmount: 5000000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'Special Equipment Fund',
      itemCategory: 'Medical Equipment',
      office: 'Cardiology Department',
      allotmentClass: 'CO',
    },
    {
      id: 'item-003',
      code: 'SUP-2024-001',
      description: 'Medical Supplies Kit',
      unit: 'pack',
      quantity: 1500, // Increased from 1000 (+500 delta)
      unitCost: 5000,
      totalAmount: 7500000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Supplies',
      office: 'Hospital Supply Chain',
      allotmentClass: 'MOOE',
    },
    {
      id: 'item-004',
      code: 'OFF-2024-001',
      description: 'Office Furniture Set',
      unit: 'set',
      quantity: 20,
      unitCost: 25000,
      totalAmount: 500000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Office Equipment',
      office: 'Administrative Division',
      allotmentClass: 'CO',
    },
    {
      id: 'item-new-001',
      code: 'MED-2024-007',
      description: 'Ventilators ICU Grade',
      unit: 'unit',
      quantity: 5, // NEW ITEM
      unitCost: 2000000,
      totalAmount: 10000000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'Special Equipment Fund',
      itemCategory: 'Medical Equipment',
      office: 'ICU Department',
      allotmentClass: 'CO',
    },
    {
      id: 'item-new-002',
      code: 'MED-2024-008',
      description: 'Oxygen Delivery Systems',
      unit: 'unit',
      quantity: 20, // NEW ITEM
      unitCost: 500000,
      totalAmount: 10000000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Hospital Operations',
      allotmentClass: 'CO',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Amended PPMP v1.2 - Office/Infrastructure focus with different amendments
// This PPMP amends different items, designed for multi-PPMP testing
export const MOCK_PPMP_AMENDED_V2 = {
  id: 'ppmp-2024-002-v1.1',
  fiscalYear: 2024,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1.1,
  baselineVersion: 1,
  isAmendment: true,
  amendmentOf: 'ppmp-2024-002', // Different base PPMP
  items: [
    {
      id: 'item-001',
      code: 'MED-2024-001',
      description: 'Hospital Beds',
      unit: 'unit',
      quantity: 50,
      unitCost: 15000,
      totalAmount: 750000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Hospital Operations',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'MED-2024-002',
      description: 'ECG Machines',
      unit: 'unit',
      quantity: 15, // Increased from 10 (+5 delta)
      unitCost: 500000,
      totalAmount: 7500000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'Special Equipment Fund',
      itemCategory: 'Medical Equipment',
      office: 'Cardiology Department',
      allotmentClass: 'CO',
    },
    {
      id: 'item-003',
      code: 'SUP-2024-001',
      description: 'Medical Supplies Kit',
      unit: 'pack',
      quantity: 1000,
      unitCost: 5000,
      totalAmount: 5000000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Supplies',
      office: 'Hospital Supply Chain',
      allotmentClass: 'MOOE',
    },
    {
      id: 'item-004',
      code: 'OFF-2024-001',
      description: 'Office Furniture Set',
      unit: 'set',
      quantity: 35, // Increased from 20 (+15 delta)
      unitCost: 25000,
      totalAmount: 875000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Office Equipment',
      office: 'Administrative Division',
      allotmentClass: 'CO',
    },
    {
      id: 'item-new-003',
      code: 'OFF-2024-002',
      description: 'Desktop Computers',
      unit: 'unit',
      quantity: 30, // NEW ITEM
      unitCost: 125000,
      totalAmount: 3750000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Office Equipment',
      office: 'Administrative Division',
      allotmentClass: 'CO',
    },
    {
      id: 'item-new-004',
      code: 'OFF-2024-003',
      description: 'HVAC System Maintenance',
      unit: 'service',
      quantity: 2, // NEW ITEM
      unitCost: 800000,
      totalAmount: 1600000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Services',
      office: 'Facilities Management',
      allotmentClass: 'MOOE',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Amended PPMP v1.2 - Minimal urgent additions for quick supplemental
export const MOCK_PPMP_AMENDED_V3 = {
  id: 'ppmp-2024-003-v1.1',
  fiscalYear: 2024,
  procuringEntity: 'Department of Health',
  ppmpVersion: 1.1,
  baselineVersion: 1,
  isAmendment: true,
  amendmentOf: 'ppmp-2024-003', // Different base PPMP
  items: [
    {
      id: 'item-001',
      code: 'MED-2024-001',
      description: 'Hospital Beds',
      unit: 'unit',
      quantity: 60, // Increased from 50 (+10 delta)
      unitCost: 15000,
      totalAmount: 900000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Hospital Operations',
      allotmentClass: 'CO',
    },
    {
      id: 'item-002',
      code: 'MED-2024-002',
      description: 'ECG Machines',
      unit: 'unit',
      quantity: 10,
      unitCost: 500000,
      totalAmount: 5000000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'Special Equipment Fund',
      itemCategory: 'Medical Equipment',
      office: 'Cardiology Department',
      allotmentClass: 'CO',
    },
    {
      id: 'item-003',
      code: 'SUP-2024-001',
      description: 'Medical Supplies Kit',
      unit: 'pack',
      quantity: 1200, // Increased from 1000 (+200 delta)
      unitCost: 5000,
      totalAmount: 6000000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Supplies',
      office: 'Hospital Supply Chain',
      allotmentClass: 'MOOE',
    },
    {
      id: 'item-004',
      code: 'OFF-2024-001',
      description: 'Office Furniture Set',
      unit: 'set',
      quantity: 20,
      unitCost: 25000,
      totalAmount: 500000,
      modeOfProcurement: 'Competitive bidding',
      fundSource: 'General Fund',
      itemCategory: 'Office Equipment',
      office: 'Administrative Division',
      allotmentClass: 'CO',
    },
    {
      id: 'item-new-005',
      code: 'MED-2024-009',
      description: 'Patient Monitoring Devices',
      unit: 'unit',
      quantity: 15, // NEW ITEM
      unitCost: 150000,
      totalAmount: 2250000,
      modeOfProcurement: 'Procurement by canvassing',
      fundSource: 'General Fund',
      itemCategory: 'Medical Equipment',
      office: 'Hospital Operations',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ============================================
// PPMP Helper Functions & Maps
// (Defined before MOCK_APP_LIST to avoid initialization order issues)
// ============================================

// Map PPMP IDs to base PPMP data
const PPMP_BASE_MAP: Record<string, any> = {
  'ppmp-2024-001': MOCK_PPMP_DATA,
  'ppmp-2024-002': MOCK_PPMP_DATA_002,
  'ppmp-2024-003': MOCK_PPMP_DATA_003,
  'ppmp-2024-004': MOCK_PPMP_DATA_004,
  'ppmp-2025-001': MOCK_PPMP_DATA_005,
}

// Helper: Map APP ppmpIds to eligible amended PPMPs
export const PPMP_AMENDMENTS_MAP: Record<string, any> = {
  'ppmp-2024-001': MOCK_PPMP_AMENDED_V1,
  'ppmp-2024-002': MOCK_PPMP_AMENDED_V2,
  'ppmp-2024-003': MOCK_PPMP_AMENDED_V3,
}

/**
 * Helper: Get PPMP items by ID (checks base map first, then amendments)
 */
function getPPMPItemsById(ppmpId: string) {
  if (PPMP_BASE_MAP[ppmpId]) {
    return PPMP_BASE_MAP[ppmpId].items || []
  }
  if (PPMP_AMENDMENTS_MAP[ppmpId]) {
    return PPMP_AMENDMENTS_MAP[ppmpId].items || []
  }
  return []
}

/**
 * Helper: Get aggregated PPMP items from multiple PPMPs
 * TODO: Remove if not needed in the future
 */
// function getAggregatedPPMPItems(ppmpIds: string[]) {
//   const allItems: PPMPItem[] = []
//   ppmpIds.forEach((ppmpId) => {
//     const items = getPPMPItemsById(ppmpId)
//     allItems.push(...items)
//   })
//   return allItems
// }

// Mock APP Data - Updated to support multi-PPMP amendment testing
// This APP contains references to the base PPMPs that have been amended
export const MOCK_APP_LIST = [
  {
    id: 'app-2024-001',
    ppmpIds: ['ppmp-2024-001'], // Only PPMP-001
    fiscalYear: 2024,
    appName: 'Hospital Medical Equipment APP 2024',
    appCode: 'HMEA-2024-001',
    appNumber: 'APP-2024-001',
    createdBy: 'juan.delacruz',
    aggregationResults: {
      items: [
        {
          unit: 'unit',
          items: [
            {
              id: 'item-001',
              code: 'MED-2024-001',
              description: 'Hospital Beds',
              unit: 'unit',
              quantity: 50,
              unitCost: 15000,
              totalAmount: 750000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
            {
              id: 'item-002',
              code: 'MED-2024-002',
              description: 'ECG Machines',
              unit: 'unit',
              quantity: 10,
              unitCost: 500000,
              totalAmount: 5000000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 60,
          totalAmount: 5750000,
        },
        {
          unit: 'pack',
          items: [
            {
              id: 'item-003',
              code: 'SUP-2024-001',
              description: 'Medical Supplies Kit',
              unit: 'pack',
              quantity: 1000,
              unitCost: 5000,
              totalAmount: 5000000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'General Fund',
              itemCategory: 'Supplies',
              allotmentClass: 'MOOE',
            },
          ],
          totalQuantity: 1000,
          totalAmount: 5000000,
        },
        {
          unit: 'set',
          items: [
            {
              id: 'item-004',
              code: 'OFF-2024-001',
              description: 'Office Furniture Set',
              unit: 'set',
              quantity: 20,
              unitCost: 25000,
              totalAmount: 500000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'General Fund',
              itemCategory: 'Office Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 20,
          totalAmount: 500000,
        },
      ],
      totalAmount: 11250000,
    },
    bac: createBACFromLineItems('app-2024-001', convertPPMPItemsToBACLineItems(getPPMPItemsById('ppmp-2024-001'))),
    signatories: {
      approvedBy: [{
        id: 'sign-001',
        name: 'Dr. Maria Santos',
        position: 'Hospital Director',
        department: 'Hospital Operations',
      }],
      preparedBy: [{
        id: 'sign-002',
        name: 'Juan dela Cruz',
        position: 'Procurement Officer',
        department: 'Procurement',
      }],
    },
    status: 'approved',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 'app-2024-002',
    ppmpIds: ['ppmp-2024-002'], // PPMP-002
    fiscalYear: 2024,
    appName: 'Office Infrastructure & IT Equipment APP 2024',
    appCode: 'OITE-2024-002',
    appNumber: 'APP-2024-002',
    createdBy: 'angela.reyes',
    aggregationResults: {
      items: [
        {
          unit: 'unit',
          items: [
            {
              id: 'item-001',
              code: 'MED-2024-001',
              description: 'Hospital Beds',
              unit: 'unit',
              quantity: 50,
              unitCost: 15000,
              totalAmount: 750000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
            {
              id: 'item-002',
              code: 'MED-2024-002',
              description: 'ECG Machines',
              unit: 'unit',
              quantity: 10,
              unitCost: 500000,
              totalAmount: 5000000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 60,
          totalAmount: 5750000,
        },
        {
          unit: 'set',
          items: [
            {
              id: 'item-004',
              code: 'OFF-2024-001',
              description: 'Office Furniture Set',
              unit: 'set',
              quantity: 20,
              unitCost: 25000,
              totalAmount: 500000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'General Fund',
              itemCategory: 'Office Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 20,
          totalAmount: 500000,
        },
      ],
      totalAmount: 6250000,
    },
    bac: createBACFromLineItems('app-2024-002', convertPPMPItemsToBACLineItems(getPPMPItemsById('ppmp-2024-002'))),
    signatories: {
      approvedBy: [{
        id: 'sign-003',
        name: 'Dir. Miguel Torres',
        position: 'Administrative Head',
        department: 'Administration',
      }],
      preparedBy: [{
        id: 'sign-004',
        name: 'Angela Reyes',
        position: 'Procurement Officer',
        department: 'Procurement',
      }],
    },
    status: 'approved',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
  },
  {
    id: 'app-2024-003',
    ppmpIds: ['ppmp-2024-003'], // PPMP-003
    fiscalYear: 2024,
    appName: 'Support Services & Maintenance APP 2024',
    appCode: 'SSMA-2024-003',
    appNumber: 'APP-2024-003',
    createdBy: 'linda.mercado',
    aggregationResults: {
      items: [
        {
          unit: 'unit',
          items: [
            {
              id: 'item-001',
              code: 'MED-2024-001',
              description: 'Hospital Beds',
              unit: 'unit',
              quantity: 50,
              unitCost: 15000,
              totalAmount: 750000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 50,
          totalAmount: 750000,
        },
        {
          unit: 'pack',
          items: [
            {
              id: 'item-003',
              code: 'SUP-2024-001',
              description: 'Medical Supplies Kit',
              unit: 'pack',
              quantity: 1000,
              unitCost: 5000,
              totalAmount: 5000000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'General Fund',
              itemCategory: 'Supplies',
              allotmentClass: 'MOOE',
            },
          ],
          totalQuantity: 1000,
          totalAmount: 5000000,
        },
      ],
      totalAmount: 5750000,
    },
    bac: createBACFromLineItems('app-2024-003', convertPPMPItemsToBACLineItems(getPPMPItemsById('ppmp-2024-003'))),
    signatories: {
      approvedBy: [{
        id: 'sign-005',
        name: 'Engr. Carlos Mendoza',
        position: 'Facilities Manager',
        department: 'Facilities',
      }],
      preparedBy: [{
        id: 'sign-006',
        name: 'Linda Mercado',
        position: 'Procurement Officer',
        department: 'Procurement',
      }],
    },
    status: 'approved',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
  },
]

export const MOCK_BAC_ITEMS = [
  {
    id: 'bac-item-001',
    description: 'ECG Machine',
    unit: 'unit',
    quantity: 15,
    unitCost: 150000,
    totalAmount: 2250000,
    modeOfProcurement: 'Competitive bidding',
    schedules: [
      { id: 'sch-001', period: 'Q1 2024', scheduledDate: '2024-03-15', quantity: 5 },
      { id: 'sch-002', period: 'Q2 2024', scheduledDate: '2024-06-15', quantity: 5 },
      { id: 'sch-003', period: 'Q3 2024', scheduledDate: '2024-09-15', quantity: 5 },
    ],
    eligibleForEPA: true,
  },
  {
    id: 'bac-item-002',
    description: 'Medical Supplies',
    unit: 'pack',
    quantity: 100,
    unitCost: 50000,
    totalAmount: 5000000,
    modeOfProcurement: 'Procurement by canvassing',
    schedules: [
      { id: 'sch-003', period: 'Q2 2024', scheduledDate: '2024-05-20', quantity: 10 },
    ],
    eligibleForEPA: false,
  },
  {
    id: 'bac-item-003',
    description: 'Hospital Beds',
    unit: 'unit',
    quantity: 50,
    unitCost: 15000,
    totalAmount: 750000,
    modeOfProcurement: 'Procurement by canvassing',
    schedules: [
      { id: 'sch-004', period: 'Q1 2024', scheduledDate: '2024-02-28', quantity: 12 },
      { id: 'sch-005', period: 'Q2 2024', scheduledDate: '2024-05-31', quantity: 13 },
      { id: 'sch-006', period: 'Q3 2024', scheduledDate: '2024-08-31', quantity: 12 },
      { id: 'sch-007', period: 'Q4 2024', scheduledDate: '2024-11-30', quantity: 13 },
    ],
    eligibleForEPA: true,
  },
] as const;

// Supplemental APP details with multi-PPMP support (for testing)
export const MOCK_SUPPLEMENTAL_APP = {
  id: 'supp-app-2024-001',
  sourceAPPId: 'app-2024-001',
  ppmpIds: ['ppmp-2024-001-v1.1'],
  fiscalYear: 2024,
  appName: 'Supplemental APP - Hospital Medical Equipment Q1 2024',
  appCode: 'SUPP-HMEA-2024-001',
  appNumber: 'SAPP-2024-001',
  aggregationResults: {
    items: [
      {
        unit: 'unit',
        items: [
          {
            id: 'item-001',
            code: 'MED-2024-001',
            description: 'Hospital Beds',
            unit: 'unit',
            quantity: 25,
            unitCost: 15000,
            totalAmount: 375000,
            modeOfProcurement: 'Procurement by canvassing',
            fundSource: 'General Fund',
            itemCategory: 'Medical Equipment',
            ppmpId: 'ppmp-2024-001',
            ppmpVersion: 'v1.1',
            ppmpLabel: 'PPMP v1.1',
            isModified: true,
            allotmentClass: 'CO',
          },
        ],
        totalQuantity: 25,
        totalAmount: 375000,
      },
    ],
    totalAmount: 375000,
  },
  bac: {
    id: 'bac-supp-2024-001',
    appId: 'supp-app-2024-001',
    lineItems: [],
    sourceFunds: ['General Fund'],
    totalBudget: 375000,
    modeOfProcurements: ['Procurement by canvassing'],
  },
  signatories: {
    preparedBy: {
      id: 'sig-001',
      name: 'Maria Garcia',
      position: 'Procurement Officer',
      department: 'Procurement Division',
      signatureDate: '2024-01-15T10:30:00Z',
    },
    reviewedBy: {
      id: 'sig-002',
      name: 'Juan Santos',
      position: 'Finance Manager',
      department: 'Finance Division',
      signatureDate: '2024-02-18T14:20:00Z',
    },
    approvedBy: {
      id: 'sig-003',
      name: 'Dr. Rose Dela Cruz',
      position: 'Executive Director',
      department: 'Office of the Director',
      signatureDate: '2024-02-20T13:45:00Z',
    },
  },
  status: 'published',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-02-20T14:45:00Z',
  createdBy: 'maria.garcia@doh.gov.ph',
};

// Extended APP list with multi-PPMP support for testing
export const MOCK_APP_LIST_EXTENDED = [
  {
    id: 'app-2024-002',
    ppmpIds: ['ppmp-2024-002', 'ppmp-2024-003'],
    fiscalYear: 2024,
    appName: 'Supplemental APP Q1 2024',
    appCode: 'SAPP-2024-Q1',
    appNumber: 'APP-2024-002',
    aggregationResults: {
      items: [
        {
          unit: 'set',
          items: [
            {
              id: 'item-004',
              code: 'OFF-2024-001',
              description: 'Office Furniture Set',
              unit: 'set',
              quantity: 20,
              unitCost: 25000,
              totalAmount: 500000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'Special Appropriation',
              itemCategory: 'Office Equipment',
              allotmentClass: 'CO',
            },
            {
              id: 'item-005',
              code: 'OFF-2024-002',
              description: 'Desktop Computers',
              unit: 'set',
              quantity: 30,
              unitCost: 125000,
              totalAmount: 3750000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'Special Appropriation',
              itemCategory: 'Office Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 50,
          totalAmount: 4250000,
        },
        {
          unit: 'unit',
          items: [
            {
              id: 'item-006',
              code: 'OFF-2024-003',
              description: 'Copy Machines',
              unit: 'unit',
              quantity: 5,
              unitCost: 200000,
              totalAmount: 1000000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'Special Appropriation',
              itemCategory: 'Office Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 5,
          totalAmount: 1000000,
        },
      ],
      totalAmount: 5250000,
    },
    bac: createBACFromLineItems('app-2024-002', consolidatePPMPItemsForBAC(['ppmp-2024-002', 'ppmp-2024-003'])),
    signatories: {
      preparedBy: [{
        id: 'sig-003',
        name: 'Rosa Mendoza',
        position: 'Procurement Officer',
        department: 'Procurement Division',
        signatureDate: '2024-02-01T09:15:00Z',
      }],
      reviewedBy: [{
        id: 'sig-004',
        name: 'Carlos Reyes',
        position: 'Budget Officer',
        department: 'Finance Division',
        signatureDate: '2024-02-10T10:30:00Z',
      }],
    },
    status: 'approved',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-18T11:20:00Z',
    createdBy: 'rosa.mendoza@doh.gov.ph',
  },
  {
    id: 'app-2024-003',
    ppmpIds: ['ppmp-2024-003'],
    fiscalYear: 2024,
    appName: 'Indicative APP Q2 2024',
    appCode: 'APP-2024-Q2',
    appNumber: 'APP-2024-003',
    aggregationResults: {
      items: [
        {
          unit: 'pack',
          items: [
            {
              id: 'item-007',
              code: 'MED-2024-003',
              description: 'Laboratory Reagent Kit',
              unit: 'pack',
              quantity: 500,
              unitCost: 7000,
              totalAmount: 3500000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'General Fund',
              itemCategory: 'Laboratory Supplies',
              allotmentClass: 'MOOE',
            },
            {
              id: 'item-008',
              code: 'MED-2024-004',
              description: 'Surgical Kit',
              unit: 'pack',
              quantity: 200,
              unitCost: 15000,
              totalAmount: 3000000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'General Fund',
              itemCategory: 'Surgical Supplies',
              allotmentClass: 'MOOE',
            },
          ],
          totalQuantity: 700,
          totalAmount: 6500000,
        },
      ],
      totalAmount: 3800000,
    },
    bac: {
      id: 'bac-2024-003',
      appId: 'app-2024-003',
      lineItems: [
        {
          id: 'bac-item-007',
          description: 'Laboratory Reagent Kit',
          unit: 'pack',
          quantity: 500,
          unitCost: 7000,
          totalAmount: 3500000,
          modeOfProcurement: 'Competitive bidding',
          allotmentClass: 'MOOE',
          office: 'Laboratory Division',
          schedules: [
            { id: 'sch-011', period: 'Q2 2024', scheduledDate: '2024-05-15', quantity: 250 },
            { id: 'sch-012', period: 'Q3 2024', scheduledDate: '2024-08-15', quantity: 250 },
          ],
          eligibleForEPA: true,
        },
        {
          id: 'bac-item-008',
          description: 'Surgical Kit',
          unit: 'pack',
          quantity: 200,
          unitCost: 15000,
          totalAmount: 3000000,
          modeOfProcurement: 'Competitive bidding',
          allotmentClass: 'CO',
          office: 'Surgery Department',
          schedules: [
            { id: 'sch-013', period: 'Q2 2024', scheduledDate: '2024-06-01', quantity: 100 },
            { id: 'sch-014', period: 'Q3 2024', scheduledDate: '2024-09-01', quantity: 100 },
          ],
          eligibleForEPA: false,
        },
      ],
      sourceFunds: ['General Fund'],
      totalBudget: 3800000,
      modeOfProcurements: ['Competitive bidding'],
    },
    signatories: {
      preparedBy: [{
        id: 'sig-004',
        name: 'Miguel Reyes',
        position: 'Supply Officer',
        department: 'Supply Division',
        signatureDate: '2024-02-10T13:40:00Z',
      }],
    },
    status: 'pending-review',
    createdAt: '2024-02-10T13:40:00Z',
    updatedAt: '2024-02-15T16:30:00Z',
    createdBy: 'miguel.reyes@doh.gov.ph',
  },
  {
    id: 'app-2024-004',
    ppmpIds: ['ppmp-2024-001', 'ppmp-2024-004'],
    fiscalYear: 2024,
    appName: 'Indicative APP Q3 2024',
    appCode: 'APP-2024-Q3',
    appNumber: 'APP-2024-004',
    aggregationResults: {
      items: [
        {
          unit: 'unit',
          items: [
            {
              id: 'item-009',
              code: 'MED-2024-005',
              description: 'Ultrasound Machines',
              unit: 'unit',
              quantity: 3,
              unitCost: 500000,
              totalAmount: 1500000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
            {
              id: 'item-010',
              code: 'MED-2024-006',
              description: 'X-Ray Equipment',
              unit: 'unit',
              quantity: 2,
              unitCost: 300000,
              totalAmount: 600000,
              modeOfProcurement: 'Procurement by canvassing',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 5,
          totalAmount: 2100000,
        },
      ],
      totalAmount: 2100000,
    },
    bac: createBACFromLineItems('app-2024-004', consolidatePPMPItemsForBAC(['ppmp-2024-001', 'ppmp-2024-004'])),
    signatories: {
      preparedBy: [{
        id: 'sig-005',
        name: 'Ana Lopez',
        position: 'Procurement Officer',
        department: 'Procurement Division',
        signatureDate: '2024-02-16T08:00:00Z',
      }],
    },
    status: 'draft',
    createdAt: '2024-02-16T08:00:00Z',
    updatedAt: '2024-02-16T08:00:00Z',
    createdBy: 'ana.lopez@doh.gov.ph',
  },
  {
    id: 'app-2025-001',
    ppmpIds: ['ppmp-2025-001'],
    fiscalYear: 2025,
    appName: 'Indicative APP 2025',
    appCode: 'APP-2025-001',
    appNumber: 'APP-2025-001',
    aggregationResults: {
      items: [
        {
          unit: 'unit',
          items: [
            {
              id: 'item-011',
              code: 'MED-2025-001',
              description: 'CT Scanner',
              unit: 'unit',
              quantity: 1,
              unitCost: 5000000,
              totalAmount: 5000000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'Special Appropriation',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
            {
              id: 'item-012',
              code: 'MED-2025-002',
              description: 'MRI Machine',
              unit: 'unit',
              quantity: 1,
              unitCost: 3900000,
              totalAmount: 3900000,
              modeOfProcurement: 'Competitive bidding',
              fundSource: 'General Fund',
              itemCategory: 'Medical Equipment',
              allotmentClass: 'CO',
            },
          ],
          totalQuantity: 2,
          totalAmount: 8900000,
        },
      ],
      totalAmount: 8900000,
    },
    bac: createBACFromLineItems('app-2025-001', convertPPMPItemsToBACLineItems(getPPMPItemsById('ppmp-2025-001'))),
    signatories: {
      preparedBy: [{
        id: 'sig-006',
        name: 'Jose Martinez',
        position: 'Procurement Officer',
        department: 'Procurement Division',
        signatureDate: '2024-12-01T10:00:00Z',
      }],
      reviewedBy: [{
        id: 'sig-007',
        name: 'Elena Santos',
        position: 'Director of Finance',
        department: 'Finance Division',
        signatureDate: '2024-12-15T14:30:00Z',
      }],
    },
    status: 'approved',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-20T15:30:00Z',
    createdBy: 'jose.martinez@doh.gov.ph',
  },
] as const;

// Handler blueprints for React Query
export const getPPMPByIdRequest = {
  endpoint: '/ppmps/:id',
  key: ({ url, id }: { url: string; id: string }) => [url, id] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.get(finalUrl)).data
    return MOCK_PPMP_DATA
  },
}

export const createAPPRequest = {
  endpoint: '/apps',
  key: () => ['/apps'] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.post('/apps', payload)).data
    const now = new Date().toISOString()
    return {
      id: `app-${Date.now()}`,
      ppmpIds: [MOCK_PPMP_DATA.id],
      fiscalYear: 2024,
      appNumber: `APP-2024-001`,
      aggregationResults: { items: [], totalAmount: 0 },
      bac: { id: '', appId: '', lineItems: [], sourceFunds: [], totalBudget: 0, modeOfProcurements: [] },
      signatories: {},
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user',
    }
  },
}

export const updateAPPRequest = {
  endpoint: '/apps/:id',
  key: ({ id }: { id: string }) => ['/apps', id] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.put(finalUrl, payload)).data
    return MOCK_PPMP_DATA
  },
}

export const publishAPPRequest = {
  endpoint: '/apps/:id/publish',
  key: ({ id }: { id: string }) => ['/apps', id, 'publish'] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.post(finalUrl, {})).data
    return { status: 'published', updatedAt: new Date().toISOString() }
  },
}

export const listAPPsRequest = {
  endpoint: '/apps',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.get(finalUrl)).data
    return {
      data: [MOCK_PPMP_DATA],
      total: 1,
      page: 1,
      pageSize: 10,
    }
  },
}

export const aggregateItemsByUnitRequest = {
  endpoint: '/apps/aggregate',
  key: () => ['aggregate', 'by-unit'] as const,
  fetcher: async () => {
    // This is a local operation, no API call needed
    // Groups PPMP items by unit
    return {
      items: [],
      totalAmount: 0,
    }
  },
}

export const createSupplementalAPPRequest = {
  endpoint: '/apps/:id/supplemental',
  key: ({ id }: { id: string }) => ['/apps', id, 'supplemental'] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.post(finalUrl, payload)).data
    const now = new Date().toISOString()
    return {
      id: `app-supp-${Date.now()}`,
      ppmpIds: [MOCK_PPMP_DATA.id],
      fiscalYear: 2024,
      appNumber: `APP-2024-001-SUPP-1`,
      aggregationResults: { items: [], totalAmount: 0 },
      bac: { id: '', appId: '', lineItems: [], sourceFunds: [], totalBudget: 0, modeOfProcurements: [] },
      signatories: {},
      status: 'draft',
      originalAppId: 'app-2024-001',
      supplementalNumber: 1,
      deltaItems: [],
      reason: 'Mid-year supplementary budget',
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user',
    }
  },
}

export const exportAPPRequest = {
  endpoint: '/apps/:id/export/:format',
  key: ({ id, format }: { id: string; format: 'excel' | 'pdf' }) =>
    ['/apps', id, 'export', format] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call or implement client-side export
    // return (await api.get(finalUrl, { responseType: 'blob' })).data
    return new Blob()
  },
}

export const approveAPPRequest = {
  endpoint: '/apps/:id/approve',
  key: ({ id }: { id: string }) => ['/apps', id, 'approve'] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.post(finalUrl, {})).data
    return { status: 'approved', updatedAt: new Date().toISOString() }
  },
}

export const rejectAPPRequest = {
  endpoint: '/apps/:id/reject',
  key: ({ id }: { id: string }) => ['/apps', id, 'reject'] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.post(finalUrl, payload)).data
    return { status: 'draft', updatedAt: new Date().toISOString() }
  },
}

export const deleteAPPRequest = {
  endpoint: '/apps/:id',
  key: ({ id }: { id: string }) => ['/apps', id] as const,
  fetcher: async () => {
    // TODO: Replace with actual API call
    // return (await api.delete(finalUrl)).data
    return { success: true }
  },
}

// ============================================================================
// EXPORT UTILITY FUNCTIONS
// ============================================================================

// (Already exported above with proper types)

// ============================================================================
// EXPORT REQUEST HANDLERS - When files are available
// ============================================================================

// APP List Request Handler
export { getAPPListRequest, type AppListResponse } from './getAPPListRequest'

// APP Detail Request Handler
export { getAPPDetailRequest, type AppDetailResponse } from './getAPPDetailRequest'

// PPMP List Request Handler
export { getPPMPListRequest, type PPMPListResponse, type PPMPItemFromAPI } from './getPPMPListRequest'

// BAC Request Handlers
export { getBACRequest } from './getBACRequest'
export { updateBACRequest, type UpdateBACPayload } from './updateBACRequest'

// PPMP Mock Data Handlers (Development)
export { 
  getPPMPsRequest, 
  getPPMPSummariesRequest, 
  getPPMPsByStatusRequest 
} from './getPPMPsRequest'

// ── Real API Handlers ─────────────────────────────────────────────────────────

// Status mutation — replaces all mock submit/approve/reject/return handlers
export { changeAPPStatusRequest, type ChangeAPPStatusPayload, type ChangeAPPStatusResult } from './changeAPPStatusRequest'

// Analytics — fetches breakdown data from GET /apps/{id}/analytics
export { getAPPAnalyticsRequest, type APPAnalyticsResponse, type APPAnalyticsBreakdownItem, type APPFinancialBreakdown } from './getAPPAnalyticsRequest'

// Document generation — two-step POST generate + GET download blob
export { generateAppDocument, type GenerateAppDocumentPayload, type AppDocumentFormat } from './generateAppDocumentRequest'

