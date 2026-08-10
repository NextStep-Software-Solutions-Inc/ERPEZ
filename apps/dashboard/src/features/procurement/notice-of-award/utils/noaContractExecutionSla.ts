import type { NoticeOfAward, NoticeOfAwardMilestone } from '../types'

export const NOA_CONTRACT_EXECUTION_SLA_DAYS = 10

const DAY_IN_MS = 24 * 60 * 60 * 1000

export const NOA_CONTRACT_EXECUTION_MILESTONES: Array<{
  key: NoticeOfAwardMilestone
  field:
    | 'conformeReceivedDate'
    | 'performanceSecurityPostedDate'
    | 'contractExecutionDate'
  fileField:
    | 'conformeFileName'
    | 'performanceSecurityFileName'
    | 'contractFileName'
  label: string
}> = [
  {
    key: 'conforme_received_date',
    field: 'conformeReceivedDate',
    fileField: 'conformeFileName',
    label: 'Conforme Received',
  },
  {
    key: 'performance_security_posted_date',
    field: 'performanceSecurityPostedDate',
    fileField: 'performanceSecurityFileName',
    label: 'Performance Security',
  },
  {
    key: 'contract_execution_date',
    field: 'contractExecutionDate',
    fileField: 'contractFileName',
    label: 'Contract Executed',
  },
]

export type NoticeOfAwardContractExecutionSlaState = {
  isIssued: boolean
  isComplete: boolean
  isOpen: boolean
  isOverdue: boolean
  requiresCascadeDecision: boolean
  issuedDate: string | null
  deadlineDate: string | null
  daysRemaining: number | null
  elapsedDays: number | null
  progressPercent: number
  completedMilestones: number
  totalMilestones: number
  pendingMilestoneLabels: string[]
  label: string
  tone: 'muted' | 'success' | 'warning' | 'destructive'
}

function normalizeDateOnly(value: string | null | undefined) {
  if (!value) return null

  return value.includes('T') ? value.slice(0, 10) : value.split(' ')[0]
}

function parseDateOnly(value: string | null | undefined) {
  const dateOnly = normalizeDateOnly(value)

  if (!dateOnly) return null

  const parsed = new Date(`${dateOnly}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function addCalendarDaysToDateOnly(value: string, days: number): string {
  const parsed = parseDateOnly(value)

  if (!parsed) return value

  parsed.setDate(parsed.getDate() + days)
  return parsed.toISOString().slice(0, 10)
}

export function getNoaContractExecutionDeadline(noa: NoticeOfAward) {
  return (
    normalizeDateOnly(noa.contractExecutionDeadline) ??
    (noa.issuedAt
      ? addCalendarDaysToDateOnly(noa.issuedAt, NOA_CONTRACT_EXECUTION_SLA_DAYS)
      : null)
  )
}

export function getNoaMilestoneDate(
  noa: NoticeOfAward,
  milestone: NoticeOfAwardMilestone,
) {
  switch (milestone) {
    case 'conforme_received_date':
      return normalizeDateOnly(noa.conformeReceivedDate)
    case 'performance_security_posted_date':
      return normalizeDateOnly(noa.performanceSecurityPostedDate)
    case 'contract_execution_date':
      return normalizeDateOnly(noa.contractExecutionDate)
    default:
      return null
  }
}

export function getNoaMilestoneFileName(
  noa: NoticeOfAward,
  milestone: NoticeOfAwardMilestone,
) {
  switch (milestone) {
    case 'conforme_received_date':
      return noa.conformeFileName ?? null
    case 'performance_security_posted_date':
      return noa.performanceSecurityFileName ?? null
    case 'contract_execution_date':
      return noa.contractFileName ?? null
    default:
      return null
  }
}

export function getNoaContractExecutionSlaState(
  noa: NoticeOfAward,
  now: Date = new Date(),
): NoticeOfAwardContractExecutionSlaState {
  const issuedDate = normalizeDateOnly(noa.issuedAt)
  const deadlineDate = getNoaContractExecutionDeadline(noa)
  const isIssued = noa.status === 'approved' && Boolean(issuedDate)
  const completedMilestones = NOA_CONTRACT_EXECUTION_MILESTONES.filter(
    (milestone) => Boolean(getNoaMilestoneDate(noa, milestone.key)),
  )
  const pendingMilestoneLabels = NOA_CONTRACT_EXECUTION_MILESTONES.filter(
    (milestone) => !getNoaMilestoneDate(noa, milestone.key),
  ).map((milestone) => milestone.label)
  const isComplete =
    completedMilestones.length === NOA_CONTRACT_EXECUTION_MILESTONES.length

  if (!isIssued || !issuedDate || !deadlineDate) {
    return {
      isIssued: false,
      isComplete: false,
      isOpen: false,
      isOverdue: false,
      requiresCascadeDecision: false,
      issuedDate: null,
      deadlineDate: null,
      daysRemaining: null,
      elapsedDays: null,
      progressPercent: 0,
      completedMilestones: completedMilestones.length,
      totalMilestones: NOA_CONTRACT_EXECUTION_MILESTONES.length,
      pendingMilestoneLabels,
      label: 'Not issued',
      tone: 'muted',
    }
  }

  const issued = parseDateOnly(issuedDate)
  const deadline = parseDateOnly(deadlineDate)
  const today = parseDateOnly(now.toISOString())

  if (!issued || !deadline || !today) {
    return {
      isIssued,
      isComplete,
      isOpen: isIssued && !isComplete,
      isOverdue: false,
      requiresCascadeDecision: false,
      issuedDate,
      deadlineDate,
      daysRemaining: null,
      elapsedDays: null,
      progressPercent: 0,
      completedMilestones: completedMilestones.length,
      totalMilestones: NOA_CONTRACT_EXECUTION_MILESTONES.length,
      pendingMilestoneLabels,
      label: isComplete ? 'Complete' : 'Open',
      tone: isComplete ? 'success' : 'warning',
    }
  }

  const elapsedDays = Math.max(
    0,
    Math.floor((today.getTime() - issued.getTime()) / DAY_IN_MS),
  )
  const daysRemaining = Math.ceil(
    (deadline.getTime() - today.getTime()) / DAY_IN_MS,
  )
  const isOverdue = !isComplete && today.getTime() > deadline.getTime()
  const requiresCascadeDecision =
    isOverdue && !getNoaMilestoneDate(noa, 'contract_execution_date')
  const progressPercent = Math.round(
    (completedMilestones.length / NOA_CONTRACT_EXECUTION_MILESTONES.length) * 100
  )

  if (isComplete) {
    return {
      isIssued,
      isComplete,
      isOpen: false,
      isOverdue: false,
      requiresCascadeDecision: false,
      issuedDate,
      deadlineDate,
      daysRemaining,
      elapsedDays,
      progressPercent,
      completedMilestones: completedMilestones.length,
      totalMilestones: NOA_CONTRACT_EXECUTION_MILESTONES.length,
      pendingMilestoneLabels,
      label: 'Complete',
      tone: 'success',
    }
  }

  if (isOverdue) {
    return {
      isIssued,
      isComplete,
      isOpen: true,
      isOverdue,
      requiresCascadeDecision,
      issuedDate,
      deadlineDate,
      daysRemaining,
      elapsedDays,
      progressPercent,
      completedMilestones: completedMilestones.length,
      totalMilestones: NOA_CONTRACT_EXECUTION_MILESTONES.length,
      pendingMilestoneLabels,
      label: 'Overdue',
      tone: 'destructive',
    }
  }

  return {
    isIssued,
    isComplete,
    isOpen: true,
    isOverdue,
    requiresCascadeDecision,
    issuedDate,
    deadlineDate,
    daysRemaining,
    elapsedDays,
    progressPercent,
    completedMilestones: completedMilestones.length,
    totalMilestones: NOA_CONTRACT_EXECUTION_MILESTONES.length,
    pendingMilestoneLabels,
    label: `${Math.max(0, daysRemaining)} day(s) left`,
    tone: daysRemaining <= 2 ? 'warning' : 'muted',
  }
}

export function formatNoaSlaDate(value: string | null | undefined) {
  const normalized = normalizeDateOnly(value)
  return normalized ?? '-'
}
