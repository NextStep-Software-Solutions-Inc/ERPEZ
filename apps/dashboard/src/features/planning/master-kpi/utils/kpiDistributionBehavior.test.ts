import { describe, it, expect } from 'vitest'
import {
  SELECTABLE_DISTRIBUTION_BEHAVIORS,
  getDistributionBehaviorLabel,
} from './kpiDistributionBehavior'
import {
  TargetDistributionBehavior,
  getDistributionBehaviorRule,
  getDistributionBehaviorDescription,
} from '../types'
import { masterKpiTargetDistributionOptions } from './masterKpiListFilters'

describe('KPI Distribution Behavior UI Utilities', () => {
  it('contains exactly 5 distinct selectable behaviors (no duplicate Divisible)', () => {
    expect(SELECTABLE_DISTRIBUTION_BEHAVIORS).toEqual([
      TargetDistributionBehavior.SUMMATION,
      TargetDistributionBehavior.UNIFORM_AVERAGE,
      TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE,
      TargetDistributionBehavior.MAXIMUM,
      TargetDistributionBehavior.MINIMUM,
    ])
    expect(SELECTABLE_DISTRIBUTION_BEHAVIORS).toHaveLength(5)
    expect(
      SELECTABLE_DISTRIBUTION_BEHAVIORS.includes(
        TargetDistributionBehavior.DIVISIBLE_SUMMATIVE,
      ),
    ).toBe(false)
  })

  it('maps both Divisible and Summation to "Summation" label', () => {
    expect(
      getDistributionBehaviorLabel(TargetDistributionBehavior.DIVISIBLE_SUMMATIVE),
    ).toBe('Summation')
    expect(
      getDistributionBehaviorLabel(TargetDistributionBehavior.SUMMATION),
    ).toBe('Summation')
    expect(
      getDistributionBehaviorLabel(TargetDistributionBehavior.UNIFORM_AVERAGE),
    ).toBe('Uniform')
    expect(
      getDistributionBehaviorLabel(TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE),
    ).toBe('Milestone')
    expect(
      getDistributionBehaviorLabel(TargetDistributionBehavior.MAXIMUM),
    ).toBe('Maximum')
    expect(
      getDistributionBehaviorLabel(TargetDistributionBehavior.MINIMUM),
    ).toBe('Minimum')
  })

  it('provides exact mathematical validation rules for all behaviors', () => {
    const uniformRule = getDistributionBehaviorRule(TargetDistributionBehavior.UNIFORM_AVERAGE)
    expect(uniformRule).toContain('quarterly target must equal')

    const summationRule = getDistributionBehaviorRule(TargetDistributionBehavior.SUMMATION)
    expect(summationRule).toContain('Q1 + Q2 + Q3 + Q4 must equal')

    const divisibleRule = getDistributionBehaviorRule(TargetDistributionBehavior.DIVISIBLE_SUMMATIVE)
    expect(divisibleRule).toContain('Q1 + Q2 + Q3 + Q4 must equal')

    const milestoneRule = getDistributionBehaviorRule(TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE)
    expect(milestoneRule).toContain('milestone targets')

    const maximumRule = getDistributionBehaviorRule(TargetDistributionBehavior.MAXIMUM)
    expect(maximumRule).toContain('cannot exceed')

    const minimumRule = getDistributionBehaviorRule(TargetDistributionBehavior.MINIMUM)
    expect(minimumRule).toContain('must meet or exceed')
  })

  it('provides descriptions for each behavior', () => {
    expect(
      getDistributionBehaviorDescription(TargetDistributionBehavior.UNIFORM_AVERAGE),
    ).toContain('percentages, rates')
    expect(
      getDistributionBehaviorDescription(TargetDistributionBehavior.SUMMATION),
    ).toContain('cumulative amounts')
  })

  it('ensures filter options list contains exactly the 5 distinct behaviors without duplicates', () => {
    expect(masterKpiTargetDistributionOptions).toHaveLength(5)
    const labels = masterKpiTargetDistributionOptions.map((opt) => opt.label)
    const uniqueLabels = new Set(labels)
    expect(uniqueLabels.size).toBe(5)
  })
})
