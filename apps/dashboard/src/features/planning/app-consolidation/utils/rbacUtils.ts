import type { UserRole, AppStatus } from '../types'

/**
 * RBAC (Role-Based Access Control) Utilities
 *
 * Implements RA 9184 government procurement role-based permissions:
 * - BAC_SECRETARIAT: Create, Edit, Submit (owns APP lifecycle initiation)
 * - HOPE: Approve, Reject, Lock (finance authority approval)
 * - BAC_MEMBER: View-only (read-only access)
 * - ADMIN: All permissions (system administrator)
 *
 * Documentation: documentations/rbac-permissions.md
 */

/**
 * Role-to-Permissions Mapping
 * Defines what actions each role can perform
 */
export const rolePermissions: Record<UserRole, Set<string>> = {
  BAC_SECRETARIAT: new Set([
    'view:app',
    'create:app',
    'edit:app',
    'delete:app:draft',
    'submit:app',
    'view:bac',
    'edit:bac',
    'export:app',
  ]),
  HOPE: new Set([
    'view:app',
    'view:bac',
    'approve:app',
    'reject:app',
    'lock:app',
    'export:app',
  ]),
  BAC_MEMBER: new Set([
    'view:app',
    'view:bac',
    'export:app',
  ]),
  ADMIN: new Set([
    'view:app',
    'create:app',
    'edit:app',
    'delete:app',
    'submit:app',
    'view:bac',
    'edit:bac',
    'approve:app',
    'reject:app',
    'lock:app',
    'export:app',
    'admin:manage-users',
    'admin:manage-roles',
  ]),
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return rolePermissions[role]?.has(permission) ?? false
}

/**
 * Check if a role can perform an action on an APP in a specific status
 */
export function canPerformActionOnApp(role: UserRole, action: string, appStatus: AppStatus): boolean {
  const permission = `${action}:app`

  // Status-specific rules
  if (action === 'edit' && appStatus !== 'Draft') {
    return false // Only Draft APPs can be edited
  }

  if (action === 'submit' && appStatus !== 'Draft') {
    return false // Only Draft APPs can be submitted
  }

  if (action === 'approve' && appStatus !== 'Submitted') {
    return false // Only Submitted APPs can be approved
  }

  if (action === 'reject' && appStatus !== 'Submitted') {
    return false // Only Submitted APPs can be rejected
  }

  if (action === 'lock' && appStatus !== 'Approved') {
    return false // Only Approved APPs can be locked
  }

  if (action === 'delete' && appStatus !== 'Draft') {
    return false // Only Draft APPs can be deleted
  }

  // Role-based permission check
  return hasPermission(role, permission)
}

/**
 * Get available actions for a role on an APP in a specific status
 */
export function getAvailableActions(role: UserRole, appStatus: AppStatus): Array<{
  id: string
  label: string
  icon: string
  description: string
  isDangerous?: boolean
}> {
  const actions: Array<{
    id: string
    label: string
    icon: string
    description: string
    isDangerous?: boolean
  }> = []

  // View is always available
  actions.push({
    id: 'view',
    label: 'View',
    icon: 'Eye',
    description: 'View APP details and BAC items',
  })

  // Download is always available
  actions.push({
    id: 'download',
    label: 'Download PDF',
    icon: 'Download',
    description: 'Export APP as PDF',
  })

  // BAC_SECRETARIAT actions
  if (role === 'BAC_SECRETARIAT' || role === 'ADMIN') {
    if (appStatus === 'Draft') {
      actions.push({
        id: 'edit',
        label: 'Edit',
        icon: 'Edit3',
        description: 'Edit APP name, BAC items, and settings',
      })
      actions.push({
        id: 'submit',
        label: 'Submit',
        icon: 'Send',
        description: 'Submit APP for HoPE approval',
      })
      actions.push({
        id: 'delete',
        label: 'Delete',
        icon: 'Trash2',
        description: 'Permanently delete this APP',
        isDangerous: true,
      })
    }
  }

  // HOPE actions
  if (role === 'HOPE' || role === 'ADMIN') {
    if (appStatus === 'Submitted') {
      actions.push({
        id: 'approve',
        label: 'Approve',
        icon: 'CheckCircle',
        description: 'Approve APP for final lock',
      })
      actions.push({
        id: 'reject',
        label: 'Reject',
        icon: 'AlertCircle',
        description: 'Return APP to BAC Secretariat for revision',
        isDangerous: true,
      })
    }

    if (appStatus === 'Approved') {
      actions.push({
        id: 'lock',
        label: 'Lock as Final',
        icon: 'Lock',
        description: 'Lock APP as official baseline (IRREVERSIBLE)',
        isDangerous: true,
      })
    }
  }

  return actions
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    BAC_SECRETARIAT: 'BAC Secretariat',
    HOPE: 'HoPE Official',
    BAC_MEMBER: 'BAC Member',
    ADMIN: 'Administrator',
  }
  return roleNames[role] || role
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    BAC_SECRETARIAT: 'Initiates and manages APP consolidation workflow',
    HOPE: 'Approves and locks APPs for official baseline',
    BAC_MEMBER: 'Views APP details and participates in review',
    ADMIN: 'Full system access for administration',
  }
  return descriptions[role] || ''
}

/**
 * Check if a role can view BAC details
 */
export function canViewBAC(role: UserRole): boolean {
  return hasPermission(role, 'view:bac')
}

/**
 * Check if a role can edit BAC items
 */
export function canEditBAC(role: UserRole): boolean {
  return hasPermission(role, 'edit:bac')
}

/**
 * Check if a role can create new APPs
 */
export function canCreateApp(role: UserRole): boolean {
  return hasPermission(role, 'create:app')
}

/**
 * Check if a role can submit APPs
 */
export function canSubmitApp(role: UserRole): boolean {
  return hasPermission(role, 'submit:app')
}

/**
 * Check if a role can approve APPs
 */
export function canApproveApp(role: UserRole): boolean {
  return hasPermission(role, 'approve:app')
}

/**
 * Check if a role can reject APPs
 */
export function canRejectApp(role: UserRole): boolean {
  return hasPermission(role, 'reject:app')
}

/**
 * Check if a role can lock APPs
 */
export function canLockApp(role: UserRole): boolean {
  return hasPermission(role, 'lock:app')
}

/**
 * Check if a role can export APPs
 */
export function canExportApp(role: UserRole): boolean {
  return hasPermission(role, 'export:app')
}
