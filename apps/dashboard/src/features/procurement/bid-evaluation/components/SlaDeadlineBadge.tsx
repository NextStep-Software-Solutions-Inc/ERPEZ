import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SlaDeadlineBadgeProps {
  targetDeadlineDate?: string | null
  isCompleted?: boolean
  status?: string
}

export function SlaDeadlineBadge({
  targetDeadlineDate,
  isCompleted = false,
  status = '',
}: SlaDeadlineBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    isOverdue: boolean
    hasDeadline: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    isOverdue: false,
    hasDeadline: false,
  })

  useEffect(() => {
    if (!targetDeadlineDate || isCompleted || status === 'Passed' || status === 'Disqualified') {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        isOverdue: false,
        hasDeadline: false,
      })
      return
    }

    const calculateRemaining = () => {
      const targetMs = new Date(targetDeadlineDate).getTime()
      const nowMs = Date.now()
      const diffMs = targetMs - nowMs

      if (diffMs <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          isOverdue: true,
          hasDeadline: true,
        })
      } else {
        const totalSecs = Math.floor(diffMs / 1000)
        const days = Math.floor(totalSecs / (24 * 3600))
        const hours = Math.floor((totalSecs % (24 * 3600)) / 3600)
        const minutes = Math.floor((totalSecs % 3600) / 60)

        setTimeLeft({
          days,
          hours,
          minutes,
          isOverdue: false,
          hasDeadline: true,
        })
      }
    }

    calculateRemaining()
    const timer = setInterval(calculateRemaining, 10_000)
    return () => clearInterval(timer)
  }, [targetDeadlineDate, isCompleted, status])

  if (isCompleted || status === 'Passed') {
    return (
      <Badge color="success" variant="soft" className="font-bold text-[10px] flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> SLA Completed
      </Badge>
    )
  }

  if (status === 'Disqualified') {
    return (
      <Badge color="destructive" variant="soft" className="font-semibold text-[10px]">
        Disqualified
      </Badge>
    )
  }

  if (!timeLeft.hasDeadline) {
    return (
      <span className="text-muted-foreground text-xs italic font-mono">-</span>
    )
  }

  if (timeLeft.isOverdue) {
    return (
      <Badge color="destructive" className="font-bold text-[10px] flex items-center gap-1 animate-pulse shadow-sm">
        <AlertTriangle className="h-3 w-3" /> OVERDUE
      </Badge>
    )
  }

  return (
    <Badge
      color={timeLeft.days <= 1 ? 'warning' : 'info'}
      variant="soft"
      className="font-mono font-bold text-[10px] flex items-center gap-1 shadow-sm"
    >
      <Clock className="h-3 w-3" />
      {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
      {timeLeft.hours}h {timeLeft.minutes}m remaining
    </Badge>
  )
}
