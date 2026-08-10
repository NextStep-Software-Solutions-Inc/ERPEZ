import type { ProjectType } from '../types'

export const PROJECT_TYPE_OPTIONS: ProjectType[] = [
  'Goods',
  'Infra',
  'Consulting',
  'N/A',
]

export const PROCUREMENT_PERIOD_PATTERN = /^(0[1-9]|1[0-2])\/(\d{4})$/

export function isValidProcurementPeriod(value: string): boolean {
  return PROCUREMENT_PERIOD_PATTERN.test(value.trim())
}

export function isValidExpectedDeliveryPeriod(value: string): boolean {
  return isValidProcurementPeriod(value)
}

export function compareProcurementPeriods(start: string, end: string): number {
  const startMatch = start.trim().match(PROCUREMENT_PERIOD_PATTERN)
  const endMatch = end.trim().match(PROCUREMENT_PERIOD_PATTERN)

  if (!startMatch || !endMatch) {
    return NaN
  }

  const [, startMonth, startYear] = startMatch
  const [, endMonth, endYear] = endMatch
  const startNumeric = Number(startYear) * 100 + Number(startMonth)
  const endNumeric = Number(endYear) * 100 + Number(endMonth)

  return startNumeric - endNumeric
}

export function isValidProcurementRange(start: string, end: string): boolean {
  return compareProcurementPeriods(start, end) <= 0
}
