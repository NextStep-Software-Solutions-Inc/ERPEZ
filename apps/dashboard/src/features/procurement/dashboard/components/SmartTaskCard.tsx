import { AlertCircle, Calendar, ExternalLink } from 'lucide-react'
import { differenceInDays, format, isPast, parseISO } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { ConsolidationWidget } from './task-widgets/ConsolidationWidget'
import { AobWidget } from './task-widgets/AobWidget'
import { NoaWidget } from './task-widgets/NoaWidget'
import { NtpWidget } from './task-widgets/NtpWidget'
import type { ProcTaskType, ProcurementTask } from '../types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ─── Task component map: no if/else, no switch ───────────────────────────────
const taskComponentMap: Record<ProcTaskType, React.ComponentType<{ metadata: ProcurementTask['metadata'] }>> = {
  CONSOLIDATE_PR: ConsolidationWidget as React.ComponentType<{ metadata: ProcurementTask['metadata'] }>,
  EVALUATE_AOB:   AobWidget          as React.ComponentType<{ metadata: ProcurementTask['metadata'] }>,
  APPROVE_NOA:    NoaWidget          as React.ComponentType<{ metadata: ProcurementTask['metadata'] }>,
  ISSUE_NTP:      NtpWidget          as React.ComponentType<{ metadata: ProcurementTask['metadata'] }>,
}

// ─── Priority config ──────────────────────────────────────────────────────────
const priorityConfig = {
  high:   { className: 'bg-red-100 text-red-800 border-red-300',     label: 'High',    borderLeft: 'border-l-red-500' },
  medium: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium', borderLeft: 'border-l-yellow-500' },
  low:    { className: 'bg-blue-100 text-blue-800 border-blue-300',  label: 'Low',     borderLeft: 'border-l-blue-500' },
} as const

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  pending:     { className: 'bg-gray-100 text-gray-700 border-gray-300',   label: 'Pending' },
  'in-progress': { className: 'bg-blue-100 text-blue-800 border-blue-300', label: 'In Progress' },
  completed:   { className: 'bg-green-100 text-green-800 border-green-300', label: 'Completed' },
  overdue:     { className: 'bg-red-100 text-red-800 border-red-300',     label: 'Overdue' },
} as const

// ─── Type label map ───────────────────────────────────────────────────────────
const taskTypeLabel: Record<ProcTaskType, string> = {
  CONSOLIDATE_PR: 'PR Consolidation',
  EVALUATE_AOB:   'AOB Evaluation',
  APPROVE_NOA:    'NOA Approval',
  ISSUE_NTP:      'NTP Issuance',
}

interface Props {
  task: ProcurementTask
}

export function SmartTaskCard({ task }: Props) {
  const navigate = useNavigate()
  const { title, description, dueDate, priority, type, status, actionLabel, secondaryActionLabel, actionRoute, metadata } = task

  const priority_cfg = priorityConfig[priority]
  const status_cfg = statusConfig[status]

  const dueDate_ = parseISO(dueDate)
  const isOverdue = isPast(dueDate_)
  const daysLeft = differenceInDays(dueDate_, new Date())
  const isUrgent = daysLeft >= 0 && daysLeft <= 2
  const formattedDue = format(dueDate_, 'MMM dd, yyyy')

  const TaskWidget = taskComponentMap[type]

  return (
    <Card
      className={`border-l-4 ${priority_cfg.borderLeft} shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Type chip */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              {taskTypeLabel[type]}
            </p>
            <CardTitle className="text-base font-semibold text-gray-900 leading-snug">
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`${priority_cfg.className} border shrink-0 text-xs`}>
            {priority_cfg.label}
          </Badge>
        </div>

        {/* Status + due date row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className={`${status_cfg.className} border text-xs`}>
            {status_cfg.label}
          </Badge>
          <div
            className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600 font-semibold' : isUrgent ? 'text-yellow-600 font-semibold' : 'text-gray-500'
            }`}
          >
            {(isOverdue || isUrgent) && <AlertCircle className="h-3 w-3" />}
            <Calendar className="h-3 w-3" />
            <span>
              {formattedDue}
              {isOverdue && ' · Overdue'}
              {isUrgent && !isOverdue && ' · Urgent'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-4">
        {/* Dynamic widget area */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          <TaskWidget metadata={metadata} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => navigate({ to: actionRoute })}
          >
            {actionLabel}
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate({ to: actionRoute })}
          >
            {secondaryActionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
