import React from 'react'
import type { MetaActions } from '@/types/global'

interface PermissionCheckProps {
  action: MetaActions[number]
  actions: MetaActions
  children: React.ReactNode
  /**
   * When true the wrapper will render even if `actions` is empty.
   * The previous implementation treated an empty array as "allow all",
   * which can accidentally expose UI when permissions fail to load.
   * Default is `false` (deny), and in production you should never rely on
   * this flag. A global environment variable (`VITE_ALLOW_EMPTY_PERMISSIONS`)
   * can also enable the relaxed behavior for local/dev setups.
   */
  allowWhenActionsEmpty?: boolean
}

const PermissionCheck: React.FC<PermissionCheckProps> = ({
  action,
  actions,
  children,
  allowWhenActionsEmpty = false,
}) => {
  // a developer-controlled environment flag (VITE_ prefix for Vite apps) that
  // can be set in .env.local to bypass the empty-array restriction during
  // development. It should NOT be enabled in production builds.
  const allowEmptyGlobal = import.meta.env.VITE_ALLOW_EMPTY_PERMISSIONS === 'true'
  const shouldAllowEmpty = allowWhenActionsEmpty || allowEmptyGlobal

  // default-deny: if there are no permissions and we're not in a mode that
  // explicitly allows it, render nothing. This is the safest behaviour for
  // production; callers must intentionally opt into permissive mode.
  if (actions.length === 0 && !shouldAllowEmpty) {
    return null
  }

  if (!actions.includes(action)) {
    return null
  }

  return <>{children}</>
}

export default PermissionCheck
