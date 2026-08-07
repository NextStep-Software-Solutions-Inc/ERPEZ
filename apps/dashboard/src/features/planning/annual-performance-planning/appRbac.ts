/**
 * RBAC & Permission Engine for Annual Performance Planning
 * 
 * Evaluates user permissions based on role and workflow context.
 * Enforces strict data isolation and field access control.
 */

import type { APPUserRole, APPPermissions, ActivatedKPI } from './appTypes'

/**
 * Role-based permission matrix
 * Defines what each role can do in the APP workflow
 */
const ROLE_PERMISSIONS: Record<APPUserRole, Omit<APPPermissions, 'role'>> = {
  PlanningOfficer: {
    canInitializeFY: true,
    canLockFY: true,
    canActivateKPIs: true,
    canSetMandatoryTargets: true,
    canSelectKPIs: false,
    canSetTargets: true, // Reviewer mode in Step 3
    canViewStep1: true,
    canViewStep2: true,
    canViewStep3: true,
  },
  OfficeHead: {
    canInitializeFY: false,
    canLockFY: false,
    canActivateKPIs: false,
    canSetMandatoryTargets: false,
    canSelectKPIs: true, // Can select from "AvailableForShopping"
    canSetTargets: true, // Only for self-selected KPIs
    canViewStep1: true, // Read-only
    canViewStep2: true, // Read-only (but can interact with AvailableForShopping)
    canViewStep3: true, // Write access to own targets
  },
  DepartmentHead: {
    canInitializeFY: false,
    canLockFY: false,
    canActivateKPIs: false,
    canSetMandatoryTargets: false,
    canSelectKPIs: true,
    canSetTargets: true,
    canViewStep1: true,
    canViewStep2: true,
    canViewStep3: true,
  },
  SystemAdmin: {
    canInitializeFY: true,
    canLockFY: true,
    canActivateKPIs: true,
    canSetMandatoryTargets: true,
    canSelectKPIs: true,
    canSetTargets: true,
    canViewStep1: true,
    canViewStep2: true,
    canViewStep3: true,
  },
}

/**
 * Get full permission set for a user role
 */
export function getPermissionsForRole(role: APPUserRole): APPPermissions {
  return {
    role,
    ...ROLE_PERMISSIONS[role],
  }
}

/**
 * Check if user can access a specific step
 */
export function canAccessStep(role: APPUserRole, step: 1 | 2 | 3): boolean {
  const permissions = getPermissionsForRole(role)
  
  switch (step) {
    case 1:
      return permissions.canViewStep1
    case 2:
      return permissions.canViewStep2
    case 3:
      return permissions.canViewStep3
    default:
      return false
  }
}

/**
 * Check if user can edit fields in Step 1
 * Planning Officer: Full write access
 * Others: Read-only
 */
export function canEditStep1(role: APPUserRole, isLocked: boolean): boolean {
  // Read-only if FY is locked
  if (isLocked) return false
  
  // Only Planning Officer can edit
  return role === 'PlanningOfficer' || role === 'SystemAdmin'
}

/**
 * Check if user can activate KPIs in Step 2
 * Planning Officer: Can mark as "Mandated" or "AvailableForShopping"
 * Office Head: Can only select from "AvailableForShopping"
 */
export function canActivateKPIsInStep2(role: APPUserRole, isLocked: boolean): boolean {
  if (isLocked) return false
  
  const permissions = getPermissionsForRole(role)
  return permissions.canActivateKPIs || permissions.canSelectKPIs
}

/**
 * Check if user can set targets in Step 3
 * Planning Officer: Can set mandatory targets and lock them
 * Office Head: Can only set targets for their selected KPIs (if FY is unlocked)
 */
export function canSetTargetsInStep3(
  role: APPUserRole,
  isLocked: boolean,
  isOwnTarget?: boolean
): boolean {
  if (isLocked && role !== 'PlanningOfficer' && role !== 'SystemAdmin') {
    return false // Office Head cannot edit locked targets
  }
  
  const permissions = getPermissionsForRole(role)
  
  if (role === 'PlanningOfficer' || role === 'SystemAdmin') {
    return permissions.canSetTargets
  }
  
  // Office Head can only edit own targets (non-mandatory)
  return Boolean(permissions.canSetTargets && isOwnTarget)
}

/**
 * Check if user can lock a fiscal year
 */
export function canLockFiscalYear(role: APPUserRole): boolean {
  const permissions = getPermissionsForRole(role)
  return permissions.canLockFY
}

/**
 * Filter visible KPIs based on user role
 * PlanningOfficer: See all
 * OfficeHead: See Mandated + AvailableForShopping
 */
export function filterVisibleKPIs(
  kpis: ActivatedKPI[],
  _role: APPUserRole
): ActivatedKPI[] {
  // All roles can see both Mandated and AvailableForShopping
  return kpis
}

/**
 * Determine if a target field should be read-only
 * Mandated targets with isLockedByPlanning=true: Always read-only for Office Head
 * Only editable by Planning Officer
 */
export function isTargetFieldReadOnly(
  role: APPUserRole,
  isLockedByPlanning: boolean,
  isOwnTarget: boolean
): boolean {
  if (role === 'PlanningOfficer' || role === 'SystemAdmin') {
    return false // Planning Officer can always edit
  }
  
  if (!isOwnTarget) {
    return true // Can't edit targets not belonging to their unit
  }
  
  if (isLockedByPlanning) {
    return true // Mandatory locked targets are read-only
  }
  
  return false
}
