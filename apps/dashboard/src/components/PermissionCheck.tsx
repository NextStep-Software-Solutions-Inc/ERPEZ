import React from 'react'
import type { MetaActions } from '@/types/global'
import { usePermissions } from '@/hooks/usePermissions'

interface LegacyPermissionCheckProps {
  action: MetaActions[number]
  actions: MetaActions
  children: React.ReactNode
  fallback?: React.ReactNode
  allowWhenActionsEmpty?: boolean
  permission?: never
}

interface FunctionalPermissionCheckProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
  action?: never
  actions?: never
  allowWhenActionsEmpty?: never
}

export type PermissionCheckProps =
  | LegacyPermissionCheckProps
  | FunctionalPermissionCheckProps

const PermissionCheck: React.FC<PermissionCheckProps> = (props) => {
  const { hasPermission, isLoading } = usePermissions()

  // 1. Functional RBAC branch
  if ('permission' in props && props.permission) {
    if (isLoading) return null
    if (!hasPermission(props.permission)) {
      return <>{props.fallback ?? null}</>
    }
    return <>{props.children}</>
  }

  // 2. Legacy Action / MetaActions branch (backward compatibility)
  const {
    action,
    actions = [],
    children,
    fallback = null,
    allowWhenActionsEmpty = false,
  } = props as LegacyPermissionCheckProps

  const allowEmptyGlobal = import.meta.env.VITE_ALLOW_EMPTY_PERMISSIONS === 'true'
  const shouldAllowEmpty = allowWhenActionsEmpty || allowEmptyGlobal

  if (actions.length === 0 && !shouldAllowEmpty) {
    return <>{fallback}</>
  }

  if (action && !actions.includes(action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default PermissionCheck
