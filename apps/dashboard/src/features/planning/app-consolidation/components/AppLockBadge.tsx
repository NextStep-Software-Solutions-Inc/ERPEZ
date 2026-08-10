import { AlertCircle, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { isAppLocked, LOCK_MESSAGES, getLockStatusInfo } from '../utils/lockUtils'
import type { AppStatus } from '../types'

interface AppLockBadgeProps {
  status: AppStatus | undefined
  size?: 'sm' | 'md' | 'lg'
  showAlert?: boolean
}

/**
 * AppLockBadge - Display lock status with visual indicator
 *
 * Shows:
 * - Lock icon + "LOCKED" label when APP is locked
 * - Nothing when APP is not locked
 *
 * Usage:
 * ```tsx
 * <AppLockBadge status={app.status} />
 * ```
 */
export function AppLockBadge({ status, size = 'md', showAlert = false }: AppLockBadgeProps) {
  const isLocked = isAppLocked(status)

  if (!isLocked) return null

  const lockInfo = getLockStatusInfo(status)

  if (showAlert) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">{LOCK_MESSAGES.title}</h3>
          <p className="text-sm text-red-800">{LOCK_MESSAGES.warning}</p>
        </div>
      </div>
    )
  }

  const badgeVariants = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  return (
    <Badge color="destructive" className={badgeVariants[size]}>
      <Lock className="w-3 h-3 mr-1.5" />
      {lockInfo.label}
    </Badge>
  )
}

/**
 * AppLockedMessage - Display why APP is locked
 */
export function AppLockedMessage() {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
      <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-yellow-900 mb-1">{LOCK_MESSAGES.title}</h3>
        <p className="text-sm text-yellow-800">{LOCK_MESSAGES.readOnlyMessage}</p>
        <p className="text-xs text-yellow-700 mt-2">{LOCK_MESSAGES.warning}</p>
      </div>
    </div>
  )
}

/**
 * LockDisabledOverlay - Visual indicator when editing is disabled due to lock
 */
export function LockDisabledOverlay() {
  return (
    <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-medium">Locked (Read-Only)</p>
      </div>
    </div>
  )
}

/**
 * LockProtectionWrapper - Wraps content that should be disabled when APP is locked
 */
interface LockProtectionWrapperProps {
  isLocked: boolean
  children: React.ReactNode
  showOverlay?: boolean
}

export function LockProtectionWrapper({ isLocked, children, showOverlay = true }: LockProtectionWrapperProps) {
  return (
    <div className="relative">
      <div className={isLocked ? 'opacity-60 pointer-events-none' : ''}>
        {children}
      </div>
      {isLocked && showOverlay && <LockDisabledOverlay />}
    </div>
  )
}

/**
 * ReadOnlyBanner - Banner showing APP is in read-only mode
 */
interface ReadOnlyBannerProps {
  isReadOnly: boolean
  reason?: string
}

export function ReadOnlyBanner({ isReadOnly, reason }: ReadOnlyBannerProps) {
  if (!isReadOnly) return null

  return (
    <div className="p-2 bg-blue-50 border-b border-blue-200 text-center">
      <p className="text-xs text-blue-700 font-medium">
        {reason || LOCK_MESSAGES.readOnlyMessage}
      </p>
    </div>
  )
}
