import { useCallback } from 'react'
import type { UserRole, AppStatus } from '../types'
import {
  canPerformActionOnApp,
  getAvailableActions,
  canViewBAC,
  canEditBAC,
  canCreateApp,
  canSubmitApp,
  canApproveApp,
  canRejectApp,
  canLockApp,
  canExportApp,
} from '../utils/rbacUtils'

/**
 * useRBAC Hook - Provides role-based access control helpers
 *
 * Usage:
 * ```tsx
 * const { canCreate, canEdit, getActions } = useRBAC(userRole)
 * if (canCreate()) {
 *   // Show create button
 * }
 * ```
 */
export function useRBAC(userRole: UserRole) {
  const checkAction = useCallback(
    (action: string, appStatus: AppStatus) => {
      return canPerformActionOnApp(userRole, action, appStatus)
    },
    [userRole]
  )

  const getActions = useCallback(
    (appStatus: AppStatus) => {
      return getAvailableActions(userRole, appStatus)
    },
    [userRole]
  )

  return {
    // Permission checks
    canViewBAC: useCallback(() => canViewBAC(userRole), [userRole]),
    canEditBAC: useCallback(() => canEditBAC(userRole), [userRole]),
    canCreateApp: useCallback(() => canCreateApp(userRole), [userRole]),
    canSubmitApp: useCallback(() => canSubmitApp(userRole), [userRole]),
    canApproveApp: useCallback(() => canApproveApp(userRole), [userRole]),
    canRejectApp: useCallback(() => canRejectApp(userRole), [userRole]),
    canLockApp: useCallback(() => canLockApp(userRole), [userRole]),
    canExportApp: useCallback(() => canExportApp(userRole), [userRole]),

    // Action checks
    checkAction,
    getActions,
  }
}

/**
 * useRBACGuard - Protects components/routes based on role
 *
 * Usage:
 * ```tsx
 * const isAllowed = useRBACGuard(userRole, 'create')
 * if (!isAllowed) return <AccessDenied />
 * ```
 */
export function useRBACGuard(userRole: UserRole, requiredPermission: string) {
  const { canCreateApp, canSubmitApp, canApproveApp, canRejectApp, canLockApp, canEditBAC } = useRBAC(userRole)

  const permissionChecks: Record<string, () => boolean> = {
    'create:app': canCreateApp,
    'submit:app': canSubmitApp,
    'approve:app': canApproveApp,
    'reject:app': canRejectApp,
    'lock:app': canLockApp,
    'edit:bac': canEditBAC,
  }

  return permissionChecks[requiredPermission]?.() ?? false
}
