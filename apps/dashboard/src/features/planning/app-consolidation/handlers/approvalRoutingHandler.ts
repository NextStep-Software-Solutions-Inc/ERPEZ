/**
 * Approval Routing Handler - Task 3.9
 * Manages BAC → HoPE approval workflow for APP and Supplemental APP
 * Handles: Submit for approval, Approve, Reject, Lock (finalize)
 */

import type { AppMaster } from '../types'

export type ApprovalAction = 'submit' | 'approve' | 'reject' | 'lock'
export type ApprovalRole = 'BAC_SECRETARIAT' | 'HOPE' | 'ADMIN'

/**
 * Approval workflow state transitions
 */
export const APPROVAL_WORKFLOW: Record<
  'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Locked',
  {
    allowedActions: ApprovalAction[]
    allowedRoles: ApprovalRole[]
  }
> = {
  'Draft': {
    allowedActions: ['submit'],
    allowedRoles: ['BAC_SECRETARIAT', 'ADMIN'],
  },
  'Submitted': {
    allowedActions: ['approve', 'reject'],
    allowedRoles: ['HOPE', 'ADMIN'],
  },
  'Approved': {
    allowedActions: ['lock'],
    allowedRoles: ['HOPE', 'ADMIN'],
  },
  'Locked': {
    allowedActions: [],
    allowedRoles: [],
  },
  'Rejected': {
    allowedActions: ['submit'], // Can resubmit after rejection
    allowedRoles: ['BAC_SECRETARIAT', 'ADMIN'],
  },
}

/**
 * Check if action is allowed for current status and role
 */
export function isActionAllowed(
  currentStatus: AppMaster['status'],
  action: ApprovalAction,
  userRole: ApprovalRole
): boolean {
  const workflow = APPROVAL_WORKFLOW[currentStatus as keyof typeof APPROVAL_WORKFLOW]
  if (!workflow) return false

  return (
    workflow.allowedActions.includes(action) &&
    workflow.allowedRoles.includes(userRole)
  )
}

/**
 * Apply approval action to APP
 * Updates status and timestamps
 */
export function applyApprovalAction(
  app: AppMaster,
  action: ApprovalAction,
  userRole: ApprovalRole,
  userIdName: string,
  remarks?: string
): AppMaster | null {
  // Validate action is allowed
  if (!isActionAllowed(app.status, action, userRole)) {
    console.error(`Action ${action} not allowed for status ${app.status} by role ${userRole}`)
    return null
  }

  const now = new Date().toISOString()
  let updatedApp = { ...app }

  switch (action) {
    case 'submit':
      updatedApp = {
        ...updatedApp,
        status: 'Submitted',
        submittedAt: now,
        submittedBy: userIdName,
      }
      break

    case 'approve':
      updatedApp = {
        ...updatedApp,
        status: 'Approved',
        approvedAt: now,
        approvedBy: userIdName,
      }
      break

    case 'reject':
      updatedApp = {
        ...updatedApp,
        status: 'Rejected',
        rejectedAt: now,
        rejectedBy: userIdName,
        rejectionReason: remarks || 'No reason provided',
      }
      break

    case 'lock':
      updatedApp = {
        ...updatedApp,
        status: 'Locked',
        lockedAt: now,
        lockedBy: userIdName,
      }
      break
  }

  return updatedApp
}

/**
 * Get next allowed actions for current status
 */
export function getNextAllowedActions(
  status: AppMaster['status'],
  userRole: ApprovalRole
): ApprovalAction[] {
  const workflow = APPROVAL_WORKFLOW[status as keyof typeof APPROVAL_WORKFLOW]
  if (!workflow) return []

  // Return allowed actions only if the user's role is authorized for this status
  if (!workflow.allowedRoles.includes(userRole)) {
    return []
  }

  return workflow.allowedActions
}

/**
 * Generate approval history entry
 */
export interface ApprovalHistoryEntry {
  timestamp: string
  action: ApprovalAction
  performedBy: string
  fromStatus: AppMaster['status']
  toStatus: AppMaster['status']
  remarks?: string
}

export function createApprovalHistoryEntry(
  app: AppMaster,
  action: ApprovalAction,
  userIdName: string,
  fromStatus: AppMaster['status'],
  remarks?: string
): ApprovalHistoryEntry {
  return {
    timestamp: new Date().toISOString(),
    action,
    performedBy: userIdName,
    fromStatus,
    toStatus: app.status,
    remarks,
  }
}

/**
 * Mock approval history tracker
 * In real app, store in database
 */
const approvalHistoryMap = new Map<string, ApprovalHistoryEntry[]>()

export function addApprovalHistory(appId: string, entry: ApprovalHistoryEntry) {
  const history = approvalHistoryMap.get(appId) || []
  history.push(entry)
  approvalHistoryMap.set(appId, history)
}

export function getApprovalHistory(appId: string): ApprovalHistoryEntry[] {
  return approvalHistoryMap.get(appId) || []
}

/**
 * Format approval status for display
 */
export function formatApprovalStatus(app: AppMaster): string {
  switch (app.status) {
    case 'Draft':
      return 'Under Preparation'
    case 'Submitted':
      return `Submitted by ${app.submittedBy} on ${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-PH') : 'N/A'}`
    case 'Approved':
      return `Approved by ${app.approvedBy} on ${app.approvedAt ? new Date(app.approvedAt).toLocaleDateString('en-PH') : 'N/A'}`
    case 'Locked':
      return `Finalized/Published by ${app.lockedBy} on ${app.lockedAt ? new Date(app.lockedAt).toLocaleDateString('en-PH') : 'N/A'}`
    case 'Rejected':
      return `Rejected by ${app.rejectedBy}: ${app.rejectionReason}`
    default:
      return app.status
  }
}

/**
 * API integration hooks (ready for backend connection)
 * These should be replaced with actual API calls
 */
export interface ApprovalActionPayload {
  appId: string
  action: ApprovalAction
  userRole: ApprovalRole
  userId: string
  userName: string
  remarks?: string
}

/**
 * Mock API call for approval action
 * Ready to replace with actual backend endpoint
 */
export async function submitApprovalAction(payload: ApprovalActionPayload): Promise<AppMaster> {
  // TODO: Replace with actual API call
  // POST /api/app-consolidation/apps/{appId}/approval-action
  // Body: { action, userRole, userId, userName, remarks }
  // Response: Updated AppMaster

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[API READY] Approval action submitted:`, payload)
      resolve({} as AppMaster)
    }, 1000)
  })
}

/**
 * Example usage:
 * 
 * // Check if action allowed
 * if (isActionAllowed(app.status, 'approve', 'HOPE')) {
 *   // Apply action
 *   const updated = applyApprovalAction(app, 'approve', 'HOPE', 'John Doe')
 *   if (updated) {
 *     // Get history
 *     const history = getApprovalHistory(app.id)
 *     console.log('Approval history:', history)
 *   }
 * }
 */
