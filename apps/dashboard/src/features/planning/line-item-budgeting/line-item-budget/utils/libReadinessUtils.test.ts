import { describe, expect, it } from 'vitest'
import { evaluateLIBReadiness } from './libReadinessUtils'
import type { LIBDetails } from '../types'

describe('evaluateLIBReadiness', () => {
  const createMockLIB = (overrides?: Partial<LIBDetails>): LIBDetails => ({
    id: 'lib-123',
    fiscalYearId: 'fy-2026',
    fundSourceId: 'fund-1',
    officeId: 'office-1',
    sourceType: 'OPCR',
    sourceId: 'opcr-1',
    scope: 'Activity',
    name: 'IT Services Budget',
    libNumber: 'LIB-2026-001',
    status: 'Draft',
    totalAmount: 150000,
    version: 1,
    fiscalYear: { id: 'fy-2026', year: 2026 } as any,
    fundSource: { id: 'fund-1', name: 'General Fund' } as any,
    office: { id: 'office-1', name: 'IT Department' } as any,
    activities: [
      {
        id: 'act-1',
        name: 'Cloud Infrastructure Management',
        details: [
          {
            id: 'det-1',
            objectId: 'obj-1',
            description: 'Cloud Compute Subscriptions',
            budget: 150000,
            object: { id: 'obj-1', name: 'Subscription Expenses', code: '50205030' },
          } as any,
        ],
      } as any,
    ],
    ...overrides,
  })

  it('evaluates a complete valid Draft LIB as ready for submission', () => {
    const lib = createMockLIB()
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.passedChecks.length).toBeGreaterThan(0)
    expect(result.totalBudget).toBe(150000)
    expect(result.activityCount).toBe(1)
    expect(result.lineItemCount).toBe(1)
  })

  it('rejects an LIB with no activities in Activity scope', () => {
    const lib = createMockLIB({ activities: [] })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(false)
    expect(result.errors).toContain('At least one LIB Activity is required.')
  })

  it('rejects an LIB when an activity has no expenditure line items', () => {
    const lib = createMockLIB({
      activities: [
        {
          id: 'act-1',
          name: 'Cloud Infrastructure Management',
          details: [],
        } as any,
      ],
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(false)
    expect(result.errors.some((e) => e.includes('has no expenditure line items'))).toBe(true)
  })

  it('rejects an LIB with zero total budget', () => {
    const lib = createMockLIB({
      totalAmount: 0,
      activities: [
        {
          id: 'act-1',
          name: 'Cloud Infrastructure Management',
          details: [
            {
              id: 'det-1',
              objectId: 'obj-1',
              budget: 0,
            } as any,
          ],
        } as any,
      ],
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(false)
    expect(result.errors).toContain('Total LIB amount must be greater than ₱0.00.')
  })

  it('rejects an LIB missing required metadata', () => {
    const lib = createMockLIB({
      fiscalYearId: undefined,
      fiscalYear: undefined,
      fundSourceId: undefined,
      fundSource: undefined,
      officeId: undefined,
      office: undefined,
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(false)
    expect(result.errors).toContain('Fiscal Year is required.')
    expect(result.errors).toContain('Fund Source or Agency Master Budget is required.')
    expect(result.errors).toContain('Responsible Office is required.')
  })

  it('supports Project-scoped LIBs with orphan details', () => {
    const lib = createMockLIB({
      scope: 'Project',
      activities: [],
      orphanDetails: [
        {
          id: 'orphan-1',
          objectId: 'obj-1',
          budget: 200000,
        } as any,
      ],
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.totalBudget).toBe(200000)
    expect(result.lineItemCount).toBe(1)
  })

  it('evaluates Project-scoped multi-year LIB without Fiscal Year as ready for submission', () => {
    const lib = createMockLIB({
      scope: 'Project',
      fiscalYearId: undefined,
      fiscalYear: undefined,
      activities: [],
      orphanDetails: [
        {
          id: 'orphan-1',
          objectId: 'obj-1',
          budget: 200000,
        } as any,
      ],
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.totalBudget).toBe(200000)
    expect(result.lineItemCount).toBe(1)
  })

  it('evaluates Multi-year WFP Activity LIB without Fiscal Year as ready for submission', () => {
    const lib = createMockLIB({
      scope: 'Activity',
      sourceType: 'WFP',
      libNumber: 'LIB-NMMEIC-WFP-2026-2027-01a01801',
      fiscalYearId: undefined,
      fiscalYear: undefined,
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.totalBudget).toBe(150000)
    expect(result.activityCount).toBe(1)
  })

  it('rejects Single-year WFP Activity LIB missing Fiscal Year', () => {
    const lib = createMockLIB({
      scope: 'Activity',
      sourceType: 'WFP',
      libNumber: 'LIB-ITSD-WFP-2026-01a00d65',
      fiscalYearId: undefined,
      fiscalYear: undefined,
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(false)
    expect(result.errors).toContain('Fiscal Year is required.')
  })

  it('rejects OPCR Activity LIB missing Fiscal Year', () => {
    const lib = createMockLIB({
      scope: 'Activity',
      sourceType: 'OPCR',
      fiscalYearId: undefined,
      fiscalYear: undefined,
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(false)
    expect(result.errors).toContain('Fiscal Year is required.')
  })

  it('rejects Independent Activity LIB missing Fiscal Year', () => {
    const lib = createMockLIB({
      scope: 'Activity',
      sourceType: 'Independent' as any,
      sourceId: undefined,
      fiscalYearId: undefined,
      fiscalYear: undefined,
    })
    const result = evaluateLIBReadiness(lib)

    expect(result.isReady).toBe(false)
    expect(result.errors).toContain('Fiscal Year is required.')
  })
})
