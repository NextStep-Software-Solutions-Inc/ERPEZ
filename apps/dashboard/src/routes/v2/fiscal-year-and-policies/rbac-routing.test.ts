import { describe, it, expect } from 'vitest'
import {
  POLICY_TABS,
  isTabPermitted,
  resolveAccessibleTab,
  type PermissionChecker,
} from './_constants'
import { PERMISSIONS } from '@/constants/permissions'

function createChecker(grantedPermissions: string[]): PermissionChecker {
  const set = new Set(grantedPermissions)
  return {
    hasPermission: (p: string) => set.has(p),
    hasAnyPermission: (perms: readonly string[]) => perms.some((p) => set.has(p)),
    hasAllPermissions: (perms: readonly string[]) => perms.every((p) => set.has(p)),
  }
}

describe('RBAC Tab Permissions (isTabPermitted)', () => {
  it('should allow access to budget-call when user has planning.budget_call.view', () => {
    const checker = createChecker([PERMISSIONS.Planning.BudgetCall.View])
    const tab = POLICY_TABS['budget-call']

    expect(isTabPermitted(tab, checker)).toBe(true)
  })

  it('should deny access to budget-call when user lacks planning.budget_call.view', () => {
    const checker = createChecker([PERMISSIONS.Procurement.App.Manage])
    const tab = POLICY_TABS['budget-call']

    expect(isTabPermitted(tab, checker)).toBe(false)
  })

  it('should allow economic-indicators when user satisfies anyOf requirement', () => {
    const checkerManage = createChecker([
      PERMISSIONS.Planning.EconomicIndicators.Manage,
    ])
    const checkerPlanningView = createChecker([
      PERMISSIONS.Planning.FiscalYear.View,
    ])
    const checkerUnauthorized = createChecker(['some.random.permission'])
    const tab = POLICY_TABS['economic-indicators']

    expect(isTabPermitted(tab, checkerManage)).toBe(true)
    expect(isTabPermitted(tab, checkerPlanningView)).toBe(true)
    expect(isTabPermitted(tab, checkerUnauthorized)).toBe(false)
  })

  it('should fail closed when given an empty or malformed permission requirement', () => {
    const checker = createChecker(['planning.budget_call.view'])
    const malformedTab = {
      ...POLICY_TABS['budget-call'],
      requiredPermission: { anyOf: [] } as any,
    }

    expect(isTabPermitted(malformedTab, checker)).toBe(false)
  })
})

describe('Deterministic Tab Resolver (resolveAccessibleTab)', () => {
  it('should return requested tab directly if user has required permission', () => {
    const checker = createChecker([
      PERMISSIONS.Planning.FiscalYear.View,
      PERMISSIONS.Planning.BudgetCall.View,
    ])

    const result = resolveAccessibleTab({
      requestedTab: 'budget-call',
      activeDomain: 'financial-planning',
      checker,
    })

    expect(result).toEqual({
      resolvedTab: 'budget-call',
      isDenied: false,
    })
  })

  it('should resolve to first accessible sibling in the same domain when requested tab is unauthorized', () => {
    // Procurement Officer has ProcurementThresholds.Manage, but NOT budget_call.view
    const checker = createChecker([
      PERMISSIONS.Procurement.ProcurementThresholds.Manage,
    ])

    const result = resolveAccessibleTab({
      requestedTab: 'budget-call',
      activeDomain: 'financial-planning',
      checker,
    })

    // Sibling in financial-planning is procurement-thresholds
    expect(result).toEqual({
      resolvedTab: 'procurement-thresholds',
      isDenied: false,
    })
  })

  it('should fallback to first accessible tab in any domain if entire active domain is unauthorized', () => {
    // User only has workflow matrix permission (in governance-organization domain)
    const checker = createChecker([PERMISSIONS.Planning.WorkflowMatrix.Manage])

    const result = resolveAccessibleTab({
      requestedTab: 'budget-call',
      activeDomain: 'financial-planning',
      checker,
    })

    expect(result).toEqual({
      resolvedTab: 'workflow-matrices',
      isDenied: false,
    })
  })

  it('should return isDenied: true when user has zero permitted tabs in the entire module', () => {
    const checker = createChecker(['unrelated.permission.only'])

    const result = resolveAccessibleTab({
      requestedTab: 'budget-call',
      activeDomain: 'financial-planning',
      checker,
    })

    expect(result).toEqual({
      resolvedTab: null,
      isDenied: true,
    })
  })
})
