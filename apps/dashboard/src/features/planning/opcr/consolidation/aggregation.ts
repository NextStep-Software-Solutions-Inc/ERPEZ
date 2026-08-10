/**
 * OPCR Data Aggregation & Consolidation Logic
 *
 * Handles:
 * - Grouping OPCRs by Master KPI Code
 * - Aggregating targets and budgets
 * - Calculating consolidated totals
 */

import type { OPCR } from '../types/type.opcr'
import type {
  ConsolidatedKPIData,
  ConsolidatedOfficeData,
  ConsolidationSnapshot,
} from './types'
import { ConsolidationValidator } from './validation'

interface KPIActivityData {
  masterKpiCode: string
  kpiTitle: string
  behaviorTag: 'SUM' | 'AVG'
  agencyTarget: number
  activities: Array<{
    officeId: string
    officeName: string
    activityId: string
    description: string
    q1: number
    q2: number
    q3: number
    q4: number
    annualTarget: number
    proposedBudget: number
    uom: string
  }>
}

export class ConsolidationAggregator {
  /**
   * Group OPCRs by Master KPI Code
   * Maps KPI Code → Array of office submissions
   */
  static groupByKPI(opcrs: OPCR[]): Map<string, OPCR[]> {
    const grouped = new Map<string, OPCR[]>()

    opcrs.forEach((opcr) => {
      // Extract KPI code from OPCR name/id
      const kpiCode = this.extractKPICode(opcr)

      if (!grouped.has(kpiCode)) {
        grouped.set(kpiCode, [])
      }
      grouped.get(kpiCode)!.push(opcr)
    })

    return grouped
  }

  /**
   * Extract KPI code from OPCR
   * Attempts multiple strategies
   */
  private static extractKPICode(opcr: OPCR): string {
    // Strategy 1: Look for KPI- prefix in name
    if (opcr.name.includes('KPI-')) {
      const match = opcr.name.match(/KPI-\d+/i)
      if (match) return match[0]
    }

    // Strategy 2: Use first part of name
    const firstPart = opcr.name.split(' ')[0]
    if (firstPart && firstPart.length > 0) {
      return firstPart
    }

    // Fallback: Generate from ID
    return `KPI-${opcr.id.substring(0, 8).toUpperCase()}`
  }

  /**
   * Consolidate grouped OPCR data into hierarchical structure
   * Assumes backend provides KPI activity data
   */
  static consolidateByKPI(
    kpiActivities: KPIActivityData[],
  ): ConsolidatedKPIData[] {
    const consolidated: ConsolidatedKPIData[] = []

    kpiActivities.forEach((kpiData) => {
      // Group activities by office
      const officeGroups = new Map<string, typeof kpiData.activities>()

      kpiData.activities.forEach((activity) => {
        const officeKey = `${activity.officeId}-${activity.officeName}`
        if (!officeGroups.has(officeKey)) {
          officeGroups.set(officeKey, [])
        }
        officeGroups.get(officeKey)!.push(activity)
      })

      // Create consolidated office data
      const offices: ConsolidatedOfficeData[] = []
      let consolidatedTotal = 0

      officeGroups.forEach((activities, officeKey) => {
        const [officeId, officeName] = officeKey.split('-')
        const firstActivity = activities[0]

        const officeData: ConsolidatedOfficeData = {
          officeId,
          officeName,
          kpiCode: kpiData.masterKpiCode,
          annualTarget: firstActivity.annualTarget,
          q1: firstActivity.q1,
          q2: firstActivity.q2,
          q3: firstActivity.q3,
          q4: firstActivity.q4,
          proposedBudget: activities.reduce(
            (sum, a) => sum + a.proposedBudget,
            0,
          ),
          activities: activities.map((activity) => ({
            id: activity.activityId,
            description: activity.description,
            officeId: activity.officeId,
            officeName: activity.officeName,
            proposedBudget: activity.proposedBudget,
            q1Target: activity.q1,
            q2Target: activity.q2,
            q3Target: activity.q3,
            q4Target: activity.q4,
            annualTarget: activity.annualTarget,
            uom: activity.uom,
          })),
          isValid: true,
        }

        // Level 2 validation
        const level2Validation =
          ConsolidationValidator.validateOfficeLevel2(officeData)
        if (!level2Validation.isValid) {
          officeData.isValid = false
          officeData.validationError = `Quarterly sum (${level2Validation.quarterlySum}) ≠ Annual target (${officeData.annualTarget})`
        }

        offices.push(officeData)
        consolidatedTotal += officeData.annualTarget
      })

      const kpiConsolidated: ConsolidatedKPIData = {
        masterKpiCode: kpiData.masterKpiCode,
        kpiTitle: kpiData.kpiTitle,
        behaviorTag: kpiData.behaviorTag,
        agencyTarget: kpiData.agencyTarget,
        consolidatedTotal,
        offices,
        isValid: true,
      }

      // Level 1 validation
      const level1Validation =
        ConsolidationValidator.validateKpiLevel1(kpiConsolidated)
      if (!level1Validation.isValid) {
        kpiConsolidated.isValid = false
        if (level1Validation.deficit !== undefined) {
          kpiConsolidated.validationError = `Deficit of ${level1Validation.deficit} units (Agency: ${kpiData.agencyTarget}, Consolidated: ${consolidatedTotal})`
        } else if (level1Validation.excess !== undefined) {
          kpiConsolidated.validationError = `Excess of ${level1Validation.excess} units (Agency: ${kpiData.agencyTarget}, Consolidated: ${consolidatedTotal})`
        }
      }

      consolidated.push(kpiConsolidated)
    })

    return consolidated
  }

  /**
   * Calculate agency-wide metrics
   */
  static calculateMetrics(kpis: ConsolidatedKPIData[]): {
    totalKpis: number
    totalActivities: number
    totalBudget: number
    validKpis: number
    invalidKpis: number
  } {
    const totalActivities = kpis.reduce((sum, kpi) => {
      return (
        sum +
        kpi.offices.reduce(
          (officeSum, office) => officeSum + office.activities.length,
          0,
        )
      )
    }, 0)

    const totalBudget = kpis.reduce((sum, kpi) => {
      return (
        sum +
        kpi.offices.reduce(
          (officeSum, office) => officeSum + office.proposedBudget,
          0,
        )
      )
    }, 0)

    return {
      totalKpis: kpis.length,
      totalActivities,
      totalBudget,
      validKpis: kpis.filter((k) => k.isValid).length,
      invalidKpis: kpis.filter((k) => !k.isValid).length,
    }
  }

  /**
   * Create consolidation snapshot
   */
  static createSnapshot(
    fiscalYear: string,
    selectedOfficeIds: string[],
    consolidatedKpis: ConsolidatedKPIData[],
  ): ConsolidationSnapshot {
    const metrics = this.calculateMetrics(consolidatedKpis)

    return {
      id: `CONS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fiscalYear,
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
      selectedOfficeIds,
      consolidatedKpis,
      agencyMetrics: metrics,
    }
  }

  /**
   * Format consolidation for export/display
   */
  static formatForDisplay(kpi: ConsolidatedKPIData): {
    kpiCode: string
    title: string
    behavior: string
    agencyTarget: number
    consolidatedTotal: number
    variance: number
    status: 'VALID' | 'WARNING' | 'ERROR'
    officeCount: number
    activityCount: number
    totalBudget: number
  } {
    const variance = kpi.consolidatedTotal - kpi.agencyTarget
    const officeCount = kpi.offices.length
    const activityCount = kpi.offices.reduce(
      (sum, office) => sum + office.activities.length,
      0,
    )
    const totalBudget = kpi.offices.reduce(
      (sum, office) => sum + office.proposedBudget,
      0,
    )

    let status: 'VALID' | 'WARNING' | 'ERROR' = 'VALID'
    if (!kpi.isValid) {
      status = variance === 0 ? 'WARNING' : 'ERROR'
    }

    return {
      kpiCode: kpi.masterKpiCode,
      title: kpi.kpiTitle,
      behavior: kpi.behaviorTag,
      agencyTarget: kpi.agencyTarget,
      consolidatedTotal: kpi.consolidatedTotal,
      variance: Math.abs(variance),
      status,
      officeCount,
      activityCount,
      totalBudget,
    }
  }
}
