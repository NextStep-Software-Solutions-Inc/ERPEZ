/**
 * OPCR Consolidation Validation Utilities
 * 
 * Implements SPMS-compliant mathematical validation:
 * Level 1: Sum of Office Annual Targets = Agency Target
 * Level 2: Q1 + Q2 + Q3 + Q4 = Annual Target (per office)
 */

import type {
  ConsolidatedKPIData,
  ConsolidatedOfficeData,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types'

export class ConsolidationValidator {
  /**
   * Level 1 Validation: Agency Total
   * SUM(All Office Annual Targets) = Agency Target
   */
  static validateKpiLevel1(kpiData: ConsolidatedKPIData): {
    isValid: boolean
    deficit?: number
    excess?: number
  } {
    const officeSum = kpiData.offices.reduce((sum, office) => sum + office.annualTarget, 0)
    const agencyTarget = kpiData.agencyTarget

    if (officeSum === agencyTarget) {
      return { isValid: true }
    }

    if (officeSum < agencyTarget) {
      return {
        isValid: false,
        deficit: agencyTarget - officeSum,
      }
    }

    return {
      isValid: false,
      excess: officeSum - agencyTarget,
    }
  }

  /**
   * Level 2 Validation: Quarterly Targets
   * Q1 + Q2 + Q3 + Q4 = Annual Target (for each office)
   */
  static validateOfficeLevel2(officeData: ConsolidatedOfficeData): {
    isValid: boolean
    quarterlySum?: number
    discrepancy?: number
  } {
    const quarterlySum = officeData.q1 + officeData.q2 + officeData.q3 + officeData.q4
    const annualTarget = officeData.annualTarget

    if (quarterlySum === annualTarget) {
      return { isValid: true }
    }

    return {
      isValid: false,
      quarterlySum,
      discrepancy: Math.abs(quarterlySum - annualTarget),
    }
  }

  /**
   * Comprehensive validation for entire KPI consolidation
   */
  static validateKPI(kpiData: ConsolidatedKPIData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate Level 1 (Agency Total)
    const level1 = this.validateKpiLevel1(kpiData)
    if (!level1.isValid) {
      if (level1.deficit !== undefined) {
        errors.push({
          type: 'LEVEL_1_MISMATCH',
          kpiCode: kpiData.masterKpiCode,
          message: `Agency target deficit of ${level1.deficit} units. Expected ${kpiData.agencyTarget}, got ${kpiData.consolidatedTotal}`,
          deficit: level1.deficit,
        })
      } else if (level1.excess !== undefined) {
        warnings.push({
          type: 'HIGH_VARIANCE',
          kpiCode: kpiData.masterKpiCode,
          message: `Consolidated total exceeds agency target by ${level1.excess} units`,
          severity: 'MEDIUM',
        })
      }
    }

    // Validate Level 2 (Quarterly targets per office)
    kpiData.offices.forEach((office) => {
      const level2 = this.validateOfficeLevel2(office)
      if (!level2.isValid) {
        errors.push({
          type: 'LEVEL_2_MISMATCH',
          kpiCode: kpiData.masterKpiCode,
          officeId: office.officeId,
          message: `${office.officeName}: Quarterly targets (${office.q1}+${office.q2}+${office.q3}+${office.q4}=${level2.quarterlySum}) do not match annual target (${office.annualTarget})`,
          deficit: level2.discrepancy,
        })
      }

      // Budget validation
      if (office.proposedBudget === 0) {
        warnings.push({
          type: 'LOW_BUDGET',
          kpiCode: kpiData.masterKpiCode,
          officeId: office.officeId,
          message: `${office.officeName}: No budget allocated for this KPI`,
          severity: 'HIGH',
        })
      }
    })

    // Check for missing offices
    if (kpiData.offices.length === 0) {
      errors.push({
        type: 'MISSING_DATA',
        kpiCode: kpiData.masterKpiCode,
        message: 'No offices have submitted targets for this KPI',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate entire consolidation snapshot
   */
  static validateSnapshot(
    kpis: ConsolidatedKPIData[]
  ): {
    isValid: boolean
    totalErrors: number
    totalWarnings: number
    kpiResults: Map<string, ValidationResult>
  } {
    const kpiResults = new Map<string, ValidationResult>()
    let totalErrors = 0
    let totalWarnings = 0

    kpis.forEach((kpi) => {
      const result = this.validateKPI(kpi)
      kpiResults.set(kpi.masterKpiCode, result)
      totalErrors += result.errors.length
      totalWarnings += result.warnings.length
    })

    return {
      isValid: totalErrors === 0,
      totalErrors,
      totalWarnings,
      kpiResults,
    }
  }

  /**
   * Generate human-readable validation summary
   */
  static generateSummary(result: ValidationResult): string {
    if (result.isValid) {
      return '✓ All validations passed'
    }

    const errorCount = result.errors.length
    const warningCount = result.warnings.length

    const parts = []
    if (errorCount > 0) {
      parts.push(`${errorCount} validation error${errorCount !== 1 ? 's' : ''}`)
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`)
    }

    return parts.join(', ')
  }
}
