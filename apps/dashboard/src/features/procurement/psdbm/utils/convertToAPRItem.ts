/**
 * PSDBM to APR Item Adapter
 * 
 * Converts PSDBM catalog items to APR ConsolidatedAPRItem format
 * Handles mapping minimal PSDBM fields to comprehensive APR structure
 * 
 * Reference: convertToAPRItem.ts
 */

import type { ConsolidatedAPRItem } from '../../apr/types'
import { PSDBMCatalogMode } from '../types'
import type { PSDBMItem, PSDBMToAPRItemAdapter } from '../types'

/**
 * Generate a unique ID for the converted item
 * Format: PSDBM-{timestamp}-{random}
 */
function generateItemId(): string {
  return `PSDBM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create adapter payload from PSDBM item with user inputs
 * This is an intermediate step before creating the final ConsolidatedAPRItem
 */
export function createPSDBMAdapter(
  psdbmItem: PSDBMItem,
  options: {
    quantity?: number
    office?: string
    fundSource?: string
    mode?: PSDBMCatalogMode
    depot?: string
    fiscalYear?: number
    sourceCategory?: string
  } = {}
): PSDBMToAPRItemAdapter {
  const {
    quantity = 1,
    office = '',
    fundSource = '',
    mode = PSDBMCatalogMode.MAIN,
    depot,
    fiscalYear = new Date().getFullYear(),
    sourceCategory = 'Office Supplies',
  } = options

  const totalAmount = psdbmItem.unitPrice * quantity

  return {
    psdbmItemCode: psdbmItem.itemCode,
    itemCode: psdbmItem.itemCode,
    description: psdbmItem.description,
    unit: psdbmItem.unit,
    unitCost: psdbmItem.unitPrice,
    quantity,
    office,
    fundSource,
    totalAmount,
    itemCategory: 'Goods',
    allotmentClass: 'MOOE',
    sourceFiscalYear: fiscalYear,
    sourceCategory,
    psdbmCatalogMode: mode,
    psdbmDepot: depot,
  }
}

/**
 * Convert PSDBM adapter to final APR ConsolidatedAPRItem
 * 
 * This is the final transformation step before adding to APR
 * PSDBM items are not sourced from APP, so APP traceability fields use sensible defaults
 */
export function convertAdapterToAPRItem(
  adapter: PSDBMToAPRItemAdapter
): ConsolidatedAPRItem {
  return {
    id: generateItemId(),
    itemCode: adapter.itemCode,
    description: adapter.description,
    unit: adapter.unit,
    quantity: adapter.quantity,
    unitCost: adapter.unitCost,
    totalAmount: adapter.totalAmount,
    office: adapter.office,
    fundSource: adapter.fundSource,
    ppmpId: '', // PSDBM items don't have PPMP reference
    appId: '', // PSDBM items don't have APP reference
    itemCategory: adapter.itemCategory,
    allotmentClass: adapter.allotmentClass,
    sourceFiscalYear: adapter.sourceFiscalYear,
    sourceCategory: adapter.sourceCategory,
    sourceMonth: new Date().toLocaleString('default', { month: 'long' }), // Current month
    // APP References (SPMS Compliance) - Defaults for PSDBM-sourced items
    appLineItemId: '', // PSDBM items are not linked to APP line items
    appBACId: undefined, // No BAC reference for PSDBM items
    appApprovedQuantity: 0, // PSDBM items don't have APP approval baseline
    appApprovedBudget: 0, // PSDBM items don't have APP approval baseline
    // Variance Tracking - No variance relative to non-existent APP baseline
    quantityVariance: adapter.quantity, // Full quantity since no APP baseline
    quantityVariancePercent: 0, // No percentage variance for PSDBM items
    budgetVariance: adapter.totalAmount, // Full budget since no APP baseline
    budgetVariancePercent: 0, // No percentage variance for PSDBM items
    // Procurement Milestones - Not available for PSDBM items
    bacMilestones: undefined,
    // PSDBM Catalog - Will be populated separately if needed
    psdbmMatches: undefined,
  }
}

/**
 * One-step conversion: PSDBM Item → APR ConsolidatedAPRItem
 * 
 * Convenience function combining createPSDBMAdapter + convertAdapterToAPRItem
 */
export function convertPSDBMItemToAPR(
  psdbmItem: PSDBMItem,
  options: {
    quantity?: number
    office?: string
    fundSource?: string
    mode?: PSDBMCatalogMode
    depot?: string
    fiscalYear?: number
    sourceCategory?: string
  } = {}
): ConsolidatedAPRItem {
  const adapter = createPSDBMAdapter(psdbmItem, options)
  return convertAdapterToAPRItem(adapter)
}

/**
 * Batch convert multiple PSDBM items to APR items
 */
export function convertPSDBMItemsToAPR(
  psdbmItems: PSDBMItem[],
  options: {
    quantity?: number
    office?: string
    fundSource?: string
    mode?: PSDBMCatalogMode
    depot?: string
    fiscalYear?: number
    sourceCategory?: string
  } = {}
): ConsolidatedAPRItem[] {
  return psdbmItems.map((item) => convertPSDBMItemToAPR(item, options))
}

/**
 * Validate required fields before APR conversion
 * Returns error message if validation fails
 */
export function validatePSDBMConversion(
  psdbmItem: PSDBMItem,
  options: {
    office?: string
    fundSource?: string
  } = {}
): string | null {
  // Validate PSDBM item
  if (!psdbmItem.itemCode) {
    return 'Item code is missing'
  }
  if (!psdbmItem.description) {
    return 'Item description is missing'
  }
  if (!psdbmItem.unit) {
    return 'Item unit is missing'
  }
  if (psdbmItem.unitPrice <= 0) {
    return 'Item price must be greater than zero'
  }

  // Validate user inputs
  if (!options.office) {
    return 'Office must be selected'
  }
  if (!options.fundSource) {
    return 'Fund source must be selected'
  }

  return null // Valid
}

/**
 * Calculate total amount with quantity
 * Used for preview before adding to APR
 */
export function calculateAPRItemTotal(
  unitPrice: number,
  quantity: number
): number {
  return unitPrice * quantity
}

/**
 * Format item info for display in AddItem dialog
 */
export function formatPSDBMItemForDisplay(
  psdbmItem: PSDBMItem
): {
  code: string
  description: string
  price: string
  unit: string
} {
  return {
    code: psdbmItem.itemCode,
    description: psdbmItem.description.trim(),
    price: `₱${psdbmItem.unitPrice.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    unit: psdbmItem.unit,
  }
}
