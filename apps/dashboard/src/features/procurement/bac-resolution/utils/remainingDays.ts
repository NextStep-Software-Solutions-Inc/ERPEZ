import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'

export interface RemainingDaysOptions {
  isCompleted?: boolean
  maxDays?: number | null
  today?: Date
}

export interface RemainingDaysInfo {
  maxDays: number | null
  daysRemaining: number | null
  durationDays: number
  isCompleted: boolean
  isOverdue: boolean
  isToday: boolean
  variant: 'completed' | 'success' | 'warning' | 'destructive' | 'none'
  label: string
}

export type RemainingDaysResult = RemainingDaysInfo

/**
 * Computes remaining days countdown relative to current date (today).
 *
 * - If isCompleted === true -> variant 'completed', label 'Completed'
 * - If targetDate is missing or invalid -> variant 'none', label '—'
 * - If daysRemaining > 7 -> variant 'success' (green), label 'Xd left'
 * - If daysRemaining > 0 && <= 7 -> variant 'warning' (amber), label 'Xd left'
 * - If daysRemaining === 0 -> variant 'warning' (amber), label 'Due today'
 * - If daysRemaining < 0 -> variant 'destructive' (red), label 'Xd overdue'
 */
export function computeRemainingDays(
  targetDateOrStartDate: string | null | undefined,
  secondArg?: string | null | undefined | boolean | RemainingDaysOptions,
  thirdArg?: number | null | undefined,
  fourthArg?: Date,
): RemainingDaysInfo {
  let targetDateString: string | null | undefined = targetDateOrStartDate
  let isCompleted = false
  let maxDays: number | null = null
  let today: Date = new Date()

  if (typeof secondArg === 'object' && secondArg !== null) {
    // options signature: computeRemainingDays(date, { isCompleted, maxDays, today })
    isCompleted = Boolean(secondArg.isCompleted)
    maxDays = secondArg.maxDays !== undefined ? secondArg.maxDays : null
    if (secondArg.today) today = secondArg.today
  } else if (typeof secondArg === 'boolean') {
    // signature: computeRemainingDays(date, isCompleted, maxDays, today)
    isCompleted = secondArg
    maxDays = thirdArg !== undefined ? thirdArg : null
    if (fourthArg) today = fourthArg
  } else if (typeof secondArg === 'string') {
    // legacy 2-date signature: computeRemainingDays(startDate, endDate, maxDays, today)
    targetDateString = secondArg
    maxDays = thirdArg !== undefined ? thirdArg : null
    if (fourthArg) today = fourthArg
  } else {
    maxDays = thirdArg !== undefined ? thirdArg : null
    if (fourthArg) today = fourthArg
  }

  if (isCompleted) {
    return {
      maxDays,
      daysRemaining: null,
      durationDays: 0,
      isCompleted: true,
      isOverdue: false,
      isToday: false,
      variant: 'completed',
      label: 'Completed',
    }
  }

  if (!targetDateString) {
    return {
      maxDays,
      daysRemaining: null,
      durationDays: 0,
      isCompleted: false,
      isOverdue: false,
      isToday: false,
      variant: 'none',
      label: '—',
    }
  }

  let targetDate: Date
  try {
    targetDate =
      typeof targetDateString === 'string' && targetDateString.includes('-')
        ? parseISO(targetDateString)
        : new Date(targetDateString)
  } catch {
    return {
      maxDays,
      daysRemaining: null,
      durationDays: 0,
      isCompleted: false,
      isOverdue: false,
      isToday: false,
      variant: 'none',
      label: '—',
    }
  }

  if (isNaN(targetDate.getTime())) {
    return {
      maxDays,
      daysRemaining: null,
      durationDays: 0,
      isCompleted: false,
      isOverdue: false,
      isToday: false,
      variant: 'none',
      label: '—',
    }
  }

  const daysRemaining = differenceInCalendarDays(
    startOfDay(targetDate),
    startOfDay(today),
  )

  if (daysRemaining === 0) {
    return {
      maxDays,
      daysRemaining: 0,
      durationDays: 0,
      isCompleted: false,
      isOverdue: false,
      isToday: true,
      variant: 'warning',
      label: 'Due today',
    }
  }

  if (daysRemaining < 0) {
    return {
      maxDays,
      daysRemaining,
      durationDays: 0,
      isCompleted: false,
      isOverdue: true,
      isToday: false,
      variant: 'destructive',
      label: `${Math.abs(daysRemaining)}d overdue`,
    }
  }

  if (daysRemaining <= 7) {
    return {
      maxDays,
      daysRemaining,
      durationDays: 0,
      isCompleted: false,
      isOverdue: false,
      isToday: false,
      variant: 'warning',
      label: `${daysRemaining}d left`,
    }
  }

  return {
    maxDays,
    daysRemaining,
    durationDays: 0,
    isCompleted: false,
    isOverdue: false,
    isToday: false,
    variant: 'success',
    label: `${daysRemaining}d left`,
  }
}

/**
 * Returns Tailwind class names for the badge variant.
 */
export function getRemainingDaysBadgeClass(
  variant: RemainingDaysInfo['variant'],
): string {
  switch (variant) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    case 'destructive':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
    case 'none':
    default:
      return 'bg-muted text-muted-foreground border-transparent'
  }
}
