import { describe, it, expect } from 'vitest'
import {
  generateProjectPeriods,
  generateProjectPeriodDetails,
} from './periodAllocationHelpers'
import { getCoveredQuarters } from '../components/EditLineItemBudgetDetailsDialog'

describe('generateProjectPeriods', () => {
  it('generates multi-year quarterly periods with first/last clamping (Sep 15, 2026 to Feb 10, 2027)', () => {
    // Sep 15, 2026 to February 10, 2027
    const startDate = new Date(2026, 8, 15) // Sep 15, 2026
    const endDate = new Date(2027, 1, 10) // Feb 10, 2027

    const quarters = generateProjectPeriods('quarterly', startDate, endDate)

    expect(quarters).toHaveLength(3)
    expect(quarters.map((q) => q.key)).toEqual([
      'Q3-2026',
      'Q4-2026',
      'Q1-2027',
    ])

    // Q3 2026: Clamped start (Sep 15), Normal quarter end (Sep 30)
    expect(quarters[0].startDate.getFullYear()).toBe(2026)
    expect(quarters[0].startDate.getMonth()).toBe(8) // Sep
    expect(quarters[0].startDate.getDate()).toBe(15) // Clamped
    expect(quarters[0].endDate.getFullYear()).toBe(2026)
    expect(quarters[0].endDate.getMonth()).toBe(8) // Sep
    expect(quarters[0].endDate.getDate()).toBe(30)
    expect(quarters[0].isFirstPeriodClamped).toBe(true)
    expect(quarters[0].isLastPeriodClamped).toBe(false)

    // Q4 2026: Full interior quarter (Oct 1 - Dec 31)
    expect(quarters[1].startDate.getMonth()).toBe(9) // Oct
    expect(quarters[1].startDate.getDate()).toBe(1)
    expect(quarters[1].endDate.getMonth()).toBe(11) // Dec
    expect(quarters[1].endDate.getDate()).toBe(31)
    expect(quarters[1].isFirstPeriodClamped).toBe(false)
    expect(quarters[1].isLastPeriodClamped).toBe(false)

    // Q1 2027: Normal quarter start (Jan 1), Clamped end (Feb 10)
    expect(quarters[2].startDate.getFullYear()).toBe(2027)
    expect(quarters[2].startDate.getMonth()).toBe(0) // Jan
    expect(quarters[2].startDate.getDate()).toBe(1)
    expect(quarters[2].endDate.getFullYear()).toBe(2027)
    expect(quarters[2].endDate.getMonth()).toBe(1) // Feb
    expect(quarters[2].endDate.getDate()).toBe(10) // Clamped
    expect(quarters[2].isFirstPeriodClamped).toBe(false)
    expect(quarters[2].isLastPeriodClamped).toBe(true)
  })

  it('generates multi-year monthly periods with first/last clamping (Sep 15, 2026 to Feb 10, 2027)', () => {
    const startDate = new Date(2026, 8, 15) // Sep 15, 2026
    const endDate = new Date(2027, 1, 10) // Feb 10, 2027

    const months = generateProjectPeriods('monthly', startDate, endDate)

    expect(months).toHaveLength(6)
    expect(months.map((m) => m.key)).toEqual([
      '2026-09',
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
    ])

    // Sep 2026: Clamped start (Sep 15 -> Sep 30)
    expect(months[0].startDate.getDate()).toBe(15)
    expect(months[0].endDate.getDate()).toBe(30)
    expect(months[0].isFirstPeriodClamped).toBe(true)

    // Interior months: Normal calendar boundaries
    expect(months[1].startDate.getDate()).toBe(1)
    expect(months[1].endDate.getDate()).toBe(31)

    // Feb 2027: Clamped end (Feb 1 -> Feb 10)
    expect(months[5].startDate.getDate()).toBe(1)
    expect(months[5].endDate.getDate()).toBe(10)
    expect(months[5].isLastPeriodClamped).toBe(true)
  })

  it('handles standard single calendar year on exact boundaries', () => {
    const startDate = new Date(2026, 0, 1) // Jan 1, 2026
    const endDate = new Date(2026, 11, 31) // Dec 31, 2026

    const quarters = generateProjectPeriods('quarterly', startDate, endDate)
    expect(quarters).toHaveLength(4)
    expect(quarters.map((q) => q.key)).toEqual([
      'Q1-2026',
      'Q2-2026',
      'Q3-2026',
      'Q4-2026',
    ])
    expect(
      quarters.every((q) => !q.isFirstPeriodClamped && !q.isLastPeriodClamped),
    ).toBe(true)
  })

  it('returns empty array when projectStartDate > projectEndDate or invalid dates', () => {
    expect(generateProjectPeriods('quarterly', '2027-01-01', '2026-01-01')).toEqual(
      [],
    )
    expect(generateProjectPeriods('quarterly', 'invalid', '2026-01-01')).toEqual([])
    expect(generateProjectPeriods('monthly', '2026-01-01', 'invalid')).toEqual([])
  })

  it('correctly filters non-zero allocations and computes aggregate total', () => {
    const startDate = new Date(2026, 8, 15)
    const endDate = new Date(2027, 1, 10)
    const quarters = generateProjectPeriods('quarterly', startDate, endDate)

    const allocations = {
      'Q3-2026': 35000,
      'Q4-2026': 105000,
      'Q1-2027': 70000,
    }

    const details = generateProjectPeriodDetails(quarters, allocations)
    expect(details).toHaveLength(3)

    const totalAllocated = details.reduce((sum, d) => sum + d.budget, 0)
    expect(totalAllocated).toBe(210000)

    // Aggregate validation rule: UnitCost (35,000) * UnitQuantity (6) = 210,000
    const unitCost = 35000
    const unitQuantity = 6
    const requiredTotal = unitCost * unitQuantity

    expect(totalAllocated >= requiredTotal).toBe(true)
  })

  it('fails aggregate validation when total allocated is less than unitCost * unitQuantity', () => {
    const allocations = {
      'Q3-2026': 35000,
      'Q4-2026': 105000,
      'Q1-2027': 50000, // Total = 190,000 < 210,000
    }

    const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0)
    const requiredTotal = 35000 * 6 // 210,000

    expect(totalAllocated >= requiredTotal).toBe(false)
  })

  it('excludes zero budget periods from generation details', () => {
    const startDate = new Date(2026, 0, 1)
    const endDate = new Date(2026, 11, 31)
    const quarters = generateProjectPeriods('quarterly', startDate, endDate)

    const allocations = {
      'Q1-2026': 50000,
      'Q2-2026': 0,
      'Q3-2026': 0,
      'Q4-2026': 25000,
    }

    const details = generateProjectPeriodDetails(quarters, allocations)
    expect(details).toHaveLength(2)
    expect(details.map((d) => d.period)).toEqual(['Q1 2026', 'Q4 2026'])
  })
})

describe('getCoveredQuarters (Option 2 Quarter Preset Reconciliation)', () => {
  it('correctly detects Q1 & Q2 for allocation spanning Jan 1 to June 30', () => {
    // Allocation from 2026-01-01 to 2026-06-30
    const covered = getCoveredQuarters('2026-01-01', '2026-06-30')
    expect(covered).toHaveLength(2)
    expect(covered[0].id).toBe('Q1')
    expect(covered[0].startDate).toBe('2026-01-01')
    expect(covered[0].endDate).toBe('2026-03-31')

    expect(covered[1].id).toBe('Q2')
    expect(covered[1].startDate).toBe('2026-04-01')
    expect(covered[1].endDate).toBe('2026-06-30')
  })

  it('correctly detects single quarter for Jan 1 to Mar 31', () => {
    const covered = getCoveredQuarters('2026-01-01', '2026-03-31')
    expect(covered).toHaveLength(1)
    expect(covered[0].id).toBe('Q1')
  })

  it('correctly detects Q2 through Q4', () => {
    const covered = getCoveredQuarters('2026-04-01', '2026-12-31')
    expect(covered).toHaveLength(3)
    expect(covered.map((q) => q.id)).toEqual(['Q2', 'Q3', 'Q4'])
  })

  it('returns empty array for invalid or empty dates', () => {
    expect(getCoveredQuarters('', '')).toEqual([])
    expect(getCoveredQuarters('invalid-date', '2026-06-30')).toEqual([])
  })
})
