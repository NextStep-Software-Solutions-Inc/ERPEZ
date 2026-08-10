/**
 * Sequential Naming Utility - Task 3.7
 * Generates supplemental APP names with sequential numbering
 * Example: "Supplemental Annual Procurement Plan No. 1 for FY 2024"
 */

import type { AppMaster } from '../types'

/**
 * Calculate next supplemental number for a master APP
 * In real app, query database for existing supplementals
 * For now, use mock logic
 */
export function getNextSupplementalNumber(masterApp: AppMaster, existingSupplementals: any[] = []): number {
  // Mock: Count existing supplementals + 1
  return existingSupplementals.length + 1
}

/**
 * Generate official supplemental APP name
 * Format: "Supplemental Annual Procurement Plan No. [X] for FY [Year]"
 */
export function generateSupplementalAPPName(
  masterApp: AppMaster,
  supplementalNumber: number,
  quarter?: string
): string {
  const baseNameApp = `Supplemental Annual Procurement Plan No. ${supplementalNumber} for FY ${masterApp.fiscalYear}`
  if (quarter) {
    return `${baseNameApp} (${quarter})`
  }
  return baseNameApp
}

/**
 * Generate supplemental APP code
 * Format: "APP-2024-001-SUP-1" (base app code + SUP + number)
 */
export function generateSupplementalAPPCode(masterApp: AppMaster, supplementalNumber: number): string {
  return `${masterApp.appCode}-SUP-${supplementalNumber}`
}

/**
 * Get all supplemental APPs linked to a master APP
 * In real app, fetch from API
 * For now, return mock data
 */
export function getMockSupplementalAPPs(masterAppId: string): any[] {
  return [
    {
      id: `${masterAppId}-supp-1`,
      originalAppId: masterAppId,
      supplementalNumber: 1,
      supplementalName: 'Supplemental Annual Procurement Plan No. 1 for FY 2024 (Q2)',
      appCode: 'APP-2024-001-SUP-1',
      quarter: 'Q2',
      status: 'Approved',
      createdAt: new Date(2024, 3, 15).toISOString(), // April 15
      createdBy: 'John Doe',
      itemCount: 7,
      totalAmount: 750000,
    },
  ]
}

/**
 * Interface for supplemental naming context
 * Used to ensure consistency across the app
 */
export interface SupplementalNamingContext {
  masterApp: AppMaster
  supplementalNumber: number
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  referenceMemoNo?: string
}

/**
 * Generate complete supplemental APP metadata
 * Ready for API submission
 */
export function generateSupplementalAPPMetadata(
  masterApp: AppMaster,
  context: SupplementalNamingContext
) {
  return {
    appName: generateSupplementalAPPName(masterApp, context.supplementalNumber, context.quarter),
    appCode: generateSupplementalAPPCode(masterApp, context.supplementalNumber),
    appNumber: generateSupplementalAPPCode(masterApp, context.supplementalNumber),
    fiscalYear: masterApp.fiscalYear,
    appType: 'Supplemental' as const,
    supplementalNumber: context.supplementalNumber,
    quarter: context.quarter,
    originalAppId: masterApp.id,
    referenceMemoNo: context.referenceMemoNo,
  }
}
