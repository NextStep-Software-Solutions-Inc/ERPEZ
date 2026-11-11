/**
 * Smart Task Card Component
 * 
 * Unified task card component that dynamically renders contextual metrics
 * based on task type. Each task type displays a different widget showing
 * relevant dashboard statistics.
 * 
 * @module features/planning/dashboard/components/SmartTaskCard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, AlertCircle } from 'lucide-react'
import { format, isPast, parseISO } from 'date-fns'
import type { SmartTaskCard as SmartTaskCardType } from '../types'
import { OpcrMiniChart } from './task-widgets/OpcrMiniChart'
import { WfpBudgetBar } from './task-widgets/WfpBudgetBar'
import { BudgetProgress } from './task-widgets/BudgetProgress'
import { MfoStatusChips } from './task-widgets/MfoStatusChips'
import { PpmpProgress } from './task-widgets/PpmpProgress'
import { toast } from 'sonner'

interface SmartTaskCardProps {
  task: SmartTaskCardType
  onActionClick?: (taskId: string) => void
}

/**
 * Get priority badge styling
 */
function getPriorityConfig(priority: SmartTaskCardType['priority']) {
  const configs = {
    high: {
      className: 'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/25',
      label: 'High Priority',
    },
    medium: {
      className: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/25',
      label: 'Medium Priority',
    },
    low: {
      className: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-500/25',
      label: 'Low Priority',
    },
  }
  return configs[priority]
}

/**
 * Get status badge styling
 */
function getStatusConfig(status: SmartTaskCardType['status']) {
  const configs = {
    pending: {
      className: 'bg-muted text-muted-foreground border-border',
      label: 'Pending',
    },
    'in-progress': {
      className: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-500/25',
      label: 'In Progress',
    },
    completed: {
      className: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/25',
      label: 'Completed',
    },
    overdue: {
      className: 'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/25',
      label: 'Overdue',
    },
  }
  return configs[status]
}

/**
 * Format due date with relative indicator
 */
function formatDueDate(dueDateISO: string): {
  formatted: string
  isOverdue: boolean
  isUrgent: boolean
} {
  const dueDate = parseISO(dueDateISO)
  const now = new Date()
  const isOverdue = isPast(dueDate)

  // Calculate days until due
  const diffTime = dueDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const isUrgent = diffDays >= 0 && diffDays <= 2

  return {
    formatted: format(dueDate, 'MMM dd, yyyy'),
    isOverdue,
    isUrgent,
  }
}

/**
 * Render appropriate widget based on task type
 * Uses explicit type checking for proper TypeScript narrowing
 */
function renderTaskWidget(type: SmartTaskCardType['type'], metadata: SmartTaskCardType['metadata']) {
  switch (type) {
    case 'OPCR':
      if (metadata.type === 'OPCR') {
        return <OpcrMiniChart metadata={metadata} />
      }
      break
    case 'WFP':
      if (metadata.type === 'WFP') {
        return <WfpBudgetBar metadata={metadata} />
      }
      break
    case 'BUDGET':
      if (metadata.type === 'BUDGET') {
        return <BudgetProgress metadata={metadata} />
      }
      break
    case 'STRATEGY':
      if (metadata.type === 'STRATEGY') {
        return <MfoStatusChips metadata={metadata} />
      }
      break
    case 'PROCUREMENT':
      if (metadata.type === 'PROCUREMENT') {
        return <PpmpProgress metadata={metadata} />
      }
      break
  }
  return null
}

/**
 * Main Smart Task Card Component
 */
export function SmartTaskCard({ task, onActionClick }: SmartTaskCardProps) {
  const { id, title, description, dueDate, priority, type, status, actionLabel, metadata } = task

  // Get styling configs
  const priorityConfig = getPriorityConfig(priority)
  const statusConfig = getStatusConfig(status)

  // Format due date
  const { formatted: formattedDueDate, isOverdue, isUrgent } = formatDueDate(dueDate)

  // Handle action button click
  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(id)
    } else {
      // Mock action - show toast
      toast.info(`Action triggered for task: ${title}`)
    }
  }

  return (
    <Card className="bg-card border-border/80 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </CardDescription>
          </div>

          {/* Priority Badge */}
          <Badge variant="outline" className={`${priorityConfig.className} border shrink-0`}>
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {/* Status Badge */}
          <Badge variant="outline" className={`${statusConfig.className} border text-xs`}>
            {statusConfig.label}
          </Badge>

          {/* Due Date */}
          <div
            className={`flex items-center gap-1 text-xs ${
              isOverdue
                ? 'text-red-600 dark:text-red-400 font-semibold'
                : isUrgent
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-muted-foreground'
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>
              Due: {formattedDueDate}
              {isOverdue && ' (Overdue)'}
              {isUrgent && !isOverdue && ' (Urgent)'}
            </span>
          </div>

          {/* Task Type Badge */}
          <Badge color="secondary" variant="soft" className="text-xs">
            {type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Dynamic Widget based on Task Type */}
        {renderTaskWidget(type, metadata)}

        {/* Action Button */}
        <div className="mt-4">
          <Button
            onClick={handleActionClick}
            className="w-full"
            variant={priority === 'high' ? 'default' : 'outline'}
          >
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Task Queue Component - Renders list of Smart Task Cards
 */
interface TaskQueueProps {
  tasks: SmartTaskCardType[]
  onTaskAction?: (taskId: string) => void
  isLoading?: boolean
}

export function TaskQueue({ tasks, onTaskAction, isLoading }: TaskQueueProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-card border-border/80">
            <CardHeader>
              <div className="h-5 w-3/4 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <p className="text-foreground font-medium">No pending tasks</p>
          <p className="text-sm text-muted-foreground mt-1">
            You're all caught up! Great work.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <SmartTaskCard key={task.id} task={task} onActionClick={onTaskAction} />
      ))}
    </div>
  )
}
