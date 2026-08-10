/**
 * Dashboard Role Hook
 *
 * Abstracts role-based access control for the Planning Dashboard.
 * Maps Keycloak/authentication roles to simplified dashboard user roles.
 *
 * @module hooks/useDashboardRole
 */

import { useMemo } from 'react'
import { useKeycloak } from '@/providers/KeycloakProvider'
import type { UserRole } from '@/types/dashboard'
import { ROLE } from '@/lib/role'

/**
 * Hook return type with role information and helper booleans
 */
interface DashboardRoleHook {
  /** Simplified dashboard user role */
  role: UserRole
  /** True if user is a planning office user with global data access */
  isPlanningUser: boolean
  /** True if user is an office/department user with filtered data access */
  isOfficeUser: boolean
  /** True if user can access global (all departments) data */
  canAccessGlobalData: boolean
  /** Current user's department ID (for office users) - null for planning users */
  departmentId: string | null
  /** Whether the authentication system is initialized */
  isInitialized: boolean
}

/**
 * Maps application roles to dashboard user roles
 *
 * In production, this would map Keycloak realm roles or custom claims.
 * For development, uses the ROLE constant from @/lib/role
 */
function mapAppRoleToDashboardRole(
  appRole: string | null | undefined,
): UserRole {
  // Development role mapping
  // In production, this would check keycloak.tokenParsed?.realm_access?.roles
  // or keycloak.tokenParsed?.resource_access?.[clientId]?.roles

  const role = appRole || ROLE

  // Map application roles to dashboard roles
  // Adjust these mappings based on actual Keycloak role names
  const planningRoles = [
    'super_admin',
    'planning_officer',
    'planning_admin',
    'pmo_head',
    'pmo_staff',
    'planning_user',
  ]

  const officeRoles = [
    'delivery_unit',
    'office_head',
    'department_head',
    'division_chief',
    'section_chief',
    'office_user',
  ]

  if (planningRoles.includes(role.toLowerCase())) {
    return 'PLANNING_USER'
  }

  if (officeRoles.includes(role.toLowerCase())) {
    return 'OFFICE_USER'
  }

  // Default to OFFICE_USER for safety (more restrictive)
  return 'OFFICE_USER'
}

/**
 * Get user's department ID from Keycloak or auth context
 *
 * In production, this should come from:
 * - Keycloak token custom claims (keycloak.tokenParsed?.departmentId)
 * - User profile API call
 * - Organization structure API
 *
 * @param role - User's dashboard role
 * @param keycloakTokenParsed - Parsed Keycloak token (optional)
 * @returns Department ID or null for planning users (who see all departments)
 */
function getUserDepartmentId(
  role: UserRole,
  keycloakTokenParsed?: Record<string, any>,
): string | null {
  // Planning users see all departments (no filter)
  if (role === 'PLANNING_USER') {
    return null
  }

  // Try to extract from Keycloak token first
  if (keycloakTokenParsed?.departmentId) {
    return keycloakTokenParsed.departmentId
  }

  const tempOfficeId = import.meta.env.VITE_TEMP_OFFICE_ID
  if (tempOfficeId) {
    return tempOfficeId
  }

  // TODO: (Backend dependency) Keycloak token does not yet carry departmentId claim.
  // Once backend team adds departmentId to Keycloak token claims, remove this fallback.
  // Tracking this as a known limitation until departmentId is available in token.
  console.warn(
    '[useDashboardRole] Department ID not found in Keycloak token and VITE_TEMP_OFFICE_ID not set. Falling back to mock "dept-001".',
  )
  return 'dept-001' // Temporary fallback for development
}

/**
 * Custom hook for dashboard role-based access control
 *
 * @returns Dashboard role information and helper flags
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { role, isPlanningUser, canAccessGlobalData, departmentId } = useDashboardRole()
 *
 *   return (
 *     <div>
 *       {isPlanningUser && <DepartmentSelector />}
 *       {canAccessGlobalData ? (
 *         <GlobalDashboard />
 *       ) : (
 *         <DepartmentDashboard departmentId={departmentId} />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useDashboardRole(): DashboardRoleHook {
  const { isInitialized, keycloak } = useKeycloak()

  // In production, access role from Keycloak:
  // const appRole = keycloak?.tokenParsed?.realm_access?.roles?.[0]

  // Development: Use VITE_TEMP_ROLE if provided, otherwise default to ROLE constant
  const appRole = import.meta.env.VITE_TEMP_ROLE || ROLE

  const role = useMemo(() => mapAppRoleToDashboardRole(appRole), [appRole])

  const isPlanningUser = role === 'PLANNING_USER'
  const isOfficeUser = role === 'OFFICE_USER'
  const canAccessGlobalData = isPlanningUser

  // Derive departmentId from Keycloak token, environment variable, or fallback
  const departmentId = useMemo(
    () => getUserDepartmentId(role, keycloak?.tokenParsed),
    [role, keycloak?.tokenParsed],
  )
  return {
    role,
    isPlanningUser,
    isOfficeUser,
    canAccessGlobalData,
    departmentId,
    isInitialized,
  }
}

/**
 * Re-export UserRole type for convenience
 */
// Re-export the shared UserRole type for convenience
export type { UserRole } from '@/types/dashboard'
