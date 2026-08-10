import type { AppStatus } from '../types'

/**
 * Lock Mechanism Utilities - Enforce immutability for Locked APPs
 *
 * A Locked APP is the official baseline and cannot be modified:
 * - All edits are disabled (read-only mode)
 * - Cannot be submitted or approved
 * - Cannot be deleted
 * - Can only be viewed and exported
 * - This status is IRREVERSIBLE
 *
 * Documentation: documentations/lock-mechanism.md
 */

/**
 * Check if an APP status means it's locked
 */
export function isAppLocked(status: AppStatus | undefined): boolean {
  return status === 'Locked'
}

/**
 * Check if a BAC item can be edited
 * Only editable if parent APP is in Draft status
 */
export function canEditBACItem(appStatus: AppStatus | undefined): boolean {
  if (!appStatus) return false
  return appStatus === 'Draft'
}

/**
 * Get lock status badge info
 */
export function getLockStatusInfo(status: AppStatus | undefined) {
  const isLocked = isAppLocked(status)

  return {
    isLocked,
    label: isLocked ? 'LOCKED - Official Baseline' : null,
    description: isLocked
      ? 'This APP has been locked as an official baseline and cannot be edited. This status is irreversible.'
      : null,
    isDangerous: isLocked,
  }
}

/**
 * Get all disabled UI elements when APP is locked
 */
export function getDisabledActionsWhenLocked(): string[] {
  return [
    'edit',
    'submit',
    'reject',
    'approve',
    'delete',
    'addItems',
    'removeItems',
    'editItems',
    'editMoP',
    'editSchedule',
    'editRemarks',
    'toggleEPA',
    'uploadAttachments',
  ]
}

/**
 * Messages for locked APP
 */
export const LOCK_MESSAGES = {
  title: 'APP Locked',
  description: 'This Annual Procurement Plan has been locked as an official baseline.',
  warning:
    'Locked APPs cannot be edited, deleted, or modified in any way. This status is irreversible and represents the approved, final version.',
  noEditMessage: 'This APP is locked and cannot be edited.',
  noDeleteMessage: 'Locked APPs cannot be deleted.',
  noActionMessage: 'No actions are available for locked APPs.',
  readOnlyMessage: 'Displaying in read-only mode (APP is locked)',
}

/**
 * Enforce lock restrictions in UI
 * Returns object with disabled state for various elements
 */
export function getLockRestrictions(appStatus: AppStatus | undefined) {
  const isLocked = isAppLocked(appStatus)

  return {
    // Form controls
    canEdit: !isLocked,
    canDelete: !isLocked,
    canSubmit: !isLocked,
    canReject: !isLocked,
    canApprove: !isLocked,
    canLock: !isLocked,

    // BAC items
    canEditBAC: !isLocked,
    canAddBAC: !isLocked,
    canRemoveBAC: !isLocked,
    canEditMoP: !isLocked,
    canEditSchedule: !isLocked,
    canEditRemarks: !isLocked,
    canToggleEPA: !isLocked,

    // File operations
    canUpload: !isLocked,
    canDownloadPDF: true, // Always allowed
    canExport: true, // Always allowed

    // Display modes
    readOnlyMode: isLocked,
    showLockBadge: isLocked,
    hideEditButtons: isLocked,
    hideDeleteButtons: isLocked,
  }
}

/**
 * Lock status change history
 */
export interface LockHistory {
  lockedAt: Date
  lockedBy: string
  appStatus: 'Locked'
  reason?: string
  version: number
}

/**
 * Validate if APP can be locked
 * Only Approved APPs can be locked
 */
export function canLockAPP(currentStatus: AppStatus | undefined): boolean {
  return currentStatus === 'Approved'
}

/**
 * Get the lock confirmation details
 */
export function getLockConfirmationDetails() {
  return {
    title: 'Lock APP as Final Baseline',
    warning: [
      '🔒 This action is IRREVERSIBLE',
      '✗ No edits will be possible after locking',
      '✗ Cannot be rejected or re-approved',
      '✗ Cannot be deleted',
      '✓ Can still be viewed and exported',
    ],
    confirmText:
      'I understand that locking this APP is permanent and irreversible. This version will become the official baseline.',
    proceedButtonText: 'Lock APP Now',
    cancelButtonText: 'Cancel',
  }
}
