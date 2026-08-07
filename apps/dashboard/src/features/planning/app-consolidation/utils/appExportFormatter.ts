/**
 * APP Export Format Mapper - Task 2.3
 * Strict GPPB format column mapping for PDF/Excel export
 * Source: Government Procurement Policy Board (GPPB) standards
 */

import type { BACLineItem, BACMilestones } from '../types'
import { getScheduleDisplayText } from './scheduleParser'
import { BID_EVALUATION_CRITERIA_LABELS, PROCUREMENT_STRATEGY_LABELS } from '../types'

/**
 * GPPB Standard Columns for APP Export
 * Order is critical for compliance
 */
export const GPPB_COLUMNS = [
  { key: 'projectTitle', label: 'Project Title', width: 25 },
  { key: 'implementingUnit', label: 'End-User or Implementing Unit', width: 20 },
  { key: 'description', label: 'General Description of the Project', width: 25 },
  { key: 'modeOfProcurement', label: 'Mode of Procurement', width: 18 },
  { key: 'isEPA', label: 'Covered by EPA? (Yes/No)', width: 14 },
  { key: 'bidEvaluationCriteria', label: 'Criteria for Bid Evaluation', width: 20 },
  { key: 'startOfProcurement', label: 'Start of Procurement Activity', width: 16 },
  { key: 'endOfProcurement', label: 'End of Procurement Activity', width: 16 },
  { key: 'sourceOfFund', label: 'Source of Fund', width: 16 },
  { key: 'estimatedBudget', label: 'Estimated Budget / ABC (PhP)', width: 18 },
  { key: 'procurementStrategy', label: 'Procurement Strategy or Tools', width: 22 },
  { key: 'remarks', label: 'Remarks', width: 20 },
] as const

export type GPPBColumnKey = (typeof GPPB_COLUMNS)[number]['key']

export interface FormattedAPPRow {
  code: string
  projectTitle: string
  implementingUnit: string
  description: string
  modeOfProcurement: string
  isEPA: string
  bidEvaluationCriteria: string
  startOfProcurement: string
  endOfProcurement: string
  sourceOfFund: string
  estimatedBudget: number
  procurementStrategy: string
  remarks: string
  estimatedBudgetTotal: number
  estimatedBudgetMOOE: number
  estimatedBudgetCO: number
}

export function formatBACLineItemForExport(item: BACLineItem): FormattedAPPRow {
  const milestones = item.milestones || ({} as BACMilestones)

  const isMOOE = item.allotmentClass === 'MOOE'
  const estimatedBudgetMOOE = isMOOE ? item.totalAmount : 0
  const estimatedBudgetCO = !isMOOE ? item.totalAmount : 0

  const bidEvaluationText = item.bidEvaluationCriteria
    ? (BID_EVALUATION_CRITERIA_LABELS[item.bidEvaluationCriteria] || item.bidEvaluationCriteria)
    : ''

  const strategiesText = item.procurementStrategies && item.procurementStrategies.length > 0
    ? item.procurementStrategies.map((s) => PROCUREMENT_STRATEGY_LABELS[s] || s).join('; ')
    : ''

  return {
    code: item.code || item.id || '',
    projectTitle: item.description || '',
    implementingUnit: item.office || '',
    description: item.remarks || item.description || '',
    modeOfProcurement: item.modeOfProcurement || '',
    isEPA: item.eligibleForEPA ? 'Yes' : 'No',
    bidEvaluationCriteria: bidEvaluationText,
    startOfProcurement: getScheduleDisplayText(milestones.advertisementDate) || '—',
    endOfProcurement: getScheduleDisplayText(milestones.contractSigningDate) || '—',
    sourceOfFund: item.fundSource || '',
    estimatedBudget: item.totalAmount || 0,
    procurementStrategy: strategiesText,
    remarks: item.remarks || '',
    estimatedBudgetTotal: item.totalAmount || 0,
    estimatedBudgetMOOE,
    estimatedBudgetCO,
  }
}

export function formatBACLineItemsForExport(items: BACLineItem[]): FormattedAPPRow[] {
  return items.map(formatBACLineItemForExport)
}

/**
 * Calculate grand totals from formatted rows
 */
export function calculateGrandTotals(rows: FormattedAPPRow[]): {
  totalBudget: number
  totalMOOE: number
  totalCO: number
} {
  return {
    totalBudget: rows.reduce((sum, row) => sum + (row.estimatedBudgetTotal || 0), 0),
    totalMOOE: rows.reduce((sum, row) => sum + (row.estimatedBudgetMOOE || 0), 0),
    totalCO: rows.reduce((sum, row) => sum + (row.estimatedBudgetCO || 0), 0),
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format currency without symbol (for Excel sometimes)
 */
export function formatCurrencyNoSymbol(amount: number): number {
  return Math.round(amount * 100) / 100
}
