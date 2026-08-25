import type { LIB, LIBDetails } from '../types'

export interface LIBReadinessResult {
  isReady: boolean
  errors: string[]
  warnings: string[]
  passedChecks: string[]
  totalBudget: number
  activityCount: number
  lineItemCount: number
}

/**
 * Determines whether a WFP-sourced LIB is for a multi-year project.
 */
export function isMultiYearWfpLIB(
  lib: LIBDetails | LIB | undefined | null,
): boolean {
  if (!lib || lib.sourceType !== 'WFP') {
    return false
  }

  // 1. Check libNumber format (e.g. LIB-NMMEIC-WFP-2026-2027-01a01801)
  if (lib.libNumber) {
    const match = /WFP-(\d{4})-(\d{4})/i.exec(lib.libNumber)
    if (match && match[1] && match[2]) {
      return match[1] !== match[2]
    }
  }

  // 2. Check if fiscalYear string is a range (e.g. '2026 – 2027' or '2026-2027')
  if (typeof lib.fiscalYear === 'string' && /^\d{4}\s*[–-]\s*\d{4}$/.test(lib.fiscalYear)) {
    return true
  }

  // 3. Check custom multi-year property if passed
  if ((lib as any).isMultiYear || (lib as any).wfp?.isMultiYear) {
    return true
  }

  return false
}

/**
 * Pure evaluation function calculating the submission readiness of a Line-Item Budget.
 * NOTE: This is purely a client-side UX helper and representation of readiness.
 * Authoritative security and business rule validation is enforced server-side upon submission.
 */
export function evaluateLIBReadiness(
  lib: LIBDetails | LIB | undefined | null,
): LIBReadinessResult {
  const errors: string[] = []
  const warnings: string[] = []
  const passedChecks: string[] = []

  if (!lib) {
    return {
      isReady: false,
      errors: ['No Line-Item Budget data available.'],
      warnings: [],
      passedChecks: [],
      totalBudget: 0,
      activityCount: 0,
      lineItemCount: 0,
    }
  }

  // 1. Scope & Multi-Year determination
  const scope = (lib.scope || (lib as any).scopeLevel || '').toLowerCase()
  const isProjectScope = scope === 'project' || scope === 'projectlevel'
  const isMultiYearWfp = isMultiYearWfpLIB(lib)

  // 2. Metadata Checks
  let hasMetadata = true
  const hasFiscalYear =
    Boolean((lib as LIBDetails).fiscalYearId) ||
    Boolean(lib.fiscalYear?.year || (typeof lib.fiscalYear === 'string' && lib.fiscalYear))

  // Fiscal Year Requirement:
  // - Required for: OPCR-sourced LIBs, Single-Year WFP LIBs, and Single-Year Independent Activity LIBs.
  // - Optional for: Multi-Year WFP LIBs (where project dates span multiple years) and Project-Scope LIBs.
  const requiresFiscalYear = !isProjectScope && !isMultiYearWfp

  if (requiresFiscalYear && !hasFiscalYear) {
    errors.push('Fiscal Year is required.')
    hasMetadata = false
  }

  const hasFundSource =
    Boolean((lib as LIBDetails).fundSourceId) ||
    Boolean(lib.fundSource?.id || lib.fundSource?.name) ||
    Boolean((lib as any).agencyMasterBudgetId)

  if (!hasFundSource) {
    errors.push('Fund Source or Agency Master Budget is required.')
    hasMetadata = false
  }

  const hasOffice =
    Boolean((lib as LIBDetails).officeId) ||
    Boolean(lib.office?.id || lib.office?.name)

  if (!hasOffice) {
    errors.push('Responsible Office is required.')
    hasMetadata = false
  }

  if (!lib.sourceType) {
    errors.push('Source Type (OPCR, WFP, or Independent) is required.')
    hasMetadata = false
  } else if (lib.sourceType === 'OPCR' || lib.sourceType === 'WFP') {
    if (!lib.sourceId) {
      errors.push(`Source ID is required for ${lib.sourceType} sourced LIB.`)
      hasMetadata = false
    }
  }

  if (hasMetadata) {
    passedChecks.push('LIB information and source metadata complete.')
  }

  // 3. Scope & Activity Checks

  const activities = (lib.activities || []).filter(Boolean)
  let totalLineItemCount = 0
  let totalCalculatedBudget = 0

  if (!isProjectScope) {
    // Activity-scoped: Requires >= 1 activity
    if (activities.length === 0) {
      errors.push('At least one LIB Activity is required.')
    } else {
      passedChecks.push(
        `Activities configured (${activities.length} activity${activities.length > 1 ? 'ies' : ''}).`,
      )

      let incompleteActivities = 0
      activities.forEach((activity) => {
        const details = (activity.details || []).filter(Boolean)
        if (details.length === 0) {
          errors.push(
            `Activity "${activity.name || 'Untitled Activity'}" has no expenditure line items.`,
          )
          incompleteActivities++
        } else {
          totalLineItemCount += details.length
          details.forEach((d) => {
            const b = Number(d.budget) || 0
            totalCalculatedBudget += b
            if (!d.objectId && !(d as any).object?.id) {
              errors.push(
                `A line item in activity "${activity.name}" is missing a valid expenditure object.`,
              )
            }
            if (b <= 0) {
              errors.push(
                `Line item "${d.description || 'Item'}" in "${activity.name}" must have a budget greater than ₱0.00.`,
              )
            }
          })
        }
      })

      if (incompleteActivities === 0 && activities.length > 0) {
        passedChecks.push('All activities have configured expenditure line items.')
      }
    }
  } else {
    // Project-scoped: can have details in activities or in orphanDetails
    activities.forEach((activity) => {
      const details = (activity.details || []).filter(Boolean)
      totalLineItemCount += details.length
      details.forEach((d) => {
        totalCalculatedBudget += Number(d.budget) || 0
      })
    })

    const orphanDetails = ((lib as LIBDetails).orphanDetails || []).filter(Boolean)
    totalLineItemCount += orphanDetails.length
    orphanDetails.forEach((d) => {
      totalCalculatedBudget += Number(d.budget) || 0
    })

    if (totalLineItemCount === 0) {
      errors.push('At least one expenditure line item is required.')
    } else {
      passedChecks.push(
        `Expenditure line items configured (${totalLineItemCount} item${totalLineItemCount > 1 ? 's' : ''}).`,
      )
    }
  }

  // 3. Total Budget Check
  const effectiveTotalAmount = Math.max(
    totalCalculatedBudget,
    Number(lib.totalAmount) || 0,
  )

  if (effectiveTotalAmount <= 0) {
    errors.push('Total LIB amount must be greater than ₱0.00.')
  } else {
    passedChecks.push(
      `Total budget allocated: ₱${effectiveTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
    )
  }

  return {
    isReady: errors.length === 0,
    errors,
    warnings,
    passedChecks,
    totalBudget: effectiveTotalAmount,
    activityCount: activities.length,
    lineItemCount: totalLineItemCount,
  }
}
