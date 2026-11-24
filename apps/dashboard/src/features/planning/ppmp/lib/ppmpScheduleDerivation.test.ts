import { describe, expect, it } from 'vitest'
import {
  deriveScheduleDates,
  getFiscalYearDefaultDates,
  PPMP_ALLOCATION_MONTHS,
} from './ppmpScheduleDerivation'
import type { AllocationMonth } from '../types'

function createEmptyAllocations(): Record<AllocationMonth, number> {
  return PPMP_ALLOCATION_MONTHS.reduce((acc, month) => {
    acc[month] = 0
    return acc
  }, {} as Record<AllocationMonth, number>)
}

describe('ppmpScheduleDerivation', () => {
  it('returns null when no monthly quantities are allocated', () => {
    const allocations = createEmptyAllocations()
    const result = deriveScheduleDates({
      monthlyQuantities: allocations,
      fiscalYear: 2026,
    })
    expect(result).toBeNull()
  })

  it('derives correct delivery and procurement dates for mid-year quarters (e.g. Apr to Oct)', () => {
    const allocations = createEmptyAllocations()
    allocations.April = 25
    allocations.July = 25
    allocations.October = 25

    const result = deriveScheduleDates({
      monthlyQuantities: allocations,
      fiscalYear: 2026,
      procurementModeName: 'Small Value Procurement',
    })

    expect(result).not.toBeNull()
    // Delivery window: April 1, 2026 to October 31, 2026
    expect(result?.expectedDeliveryStart).toBe('2026-04-01')
    expect(result?.expectedDeliveryEnd).toBe('2026-10-31')

    // Procurement schedule: Ends day before delivery start (2026-03-31)
    // SVP lead time = 15 days (2026-03-31 minus 14 days = 2026-03-17)
    expect(result?.procurementEndDate).toBe('2026-03-31')
    expect(result?.procurementStartDate).toBe('2026-03-17')

    // Verify ordering
    expect(result!.procurementStartDate <= result!.procurementEndDate).toBe(true)
    expect(result!.procurementEndDate <= result!.expectedDeliveryStart).toBe(true)
    expect(result!.expectedDeliveryStart <= result!.expectedDeliveryEnd).toBe(true)
  })

  it('applies 30-day lead time for Public Bidding mode', () => {
    const allocations = createEmptyAllocations()
    allocations.May = 100

    const result = deriveScheduleDates({
      monthlyQuantities: allocations,
      fiscalYear: 2026,
      procurementModeName: 'Competitive Bidding (Public Bidding)',
    })

    expect(result).not.toBeNull()
    expect(result?.expectedDeliveryStart).toBe('2026-05-01')
    expect(result?.expectedDeliveryEnd).toBe('2026-05-31')

    // Procurement ends 2026-04-30
    expect(result?.procurementEndDate).toBe('2026-04-30')
    // 30 days prior: 2026-04-30 minus 29 days = 2026-04-01
    expect(result?.procurementStartDate).toBe('2026-04-01')
  })

  it('handles January allocation with fiscal year clamping', () => {
    const allocations = createEmptyAllocations()
    allocations.January = 10
    allocations.February = 10

    const result = deriveScheduleDates({
      monthlyQuantities: allocations,
      fiscalYear: 2026,
      procurementModeName: 'Shopping',
    })

    expect(result).not.toBeNull()
    expect(result?.expectedDeliveryStart).toBe('2026-01-01')
    expect(result?.expectedDeliveryEnd).toBe('2026-02-28')

    // January start clamped to fiscal year start
    expect(result?.procurementStartDate).toBe('2026-01-01')
    expect(result?.procurementEndDate).toBe('2026-01-01')
    expect(result!.procurementEndDate <= result!.expectedDeliveryStart).toBe(true)
  })

  it('returns valid fiscal year default dates when allocations are disabled', () => {
    const defaults = getFiscalYearDefaultDates(2026)
    expect(defaults.procurementStartDate).toBe('2026-01-01')
    expect(defaults.procurementEndDate).toBe('2026-01-15')
    expect(defaults.expectedDeliveryStart).toBe('2026-01-16')
    expect(defaults.expectedDeliveryEnd).toBe('2026-12-31')

    // Strict validation requirement:
    expect(defaults.procurementStartDate <= defaults.procurementEndDate).toBe(true)
    expect(defaults.procurementEndDate <= defaults.expectedDeliveryStart).toBe(true)
    expect(defaults.expectedDeliveryStart <= defaults.expectedDeliveryEnd).toBe(true)
  })
})
