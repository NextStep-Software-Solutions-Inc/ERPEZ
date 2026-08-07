import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'
import type { ProcurementTask } from '../types'
import { SmartTaskCard } from './SmartTaskCard'

interface Props {
  tasks: ProcurementTask[]
  isLoading?: boolean
}

function TaskCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-200 animate-pulse">
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-64 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-24 w-full bg-gray-100 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-8 flex-1 bg-gray-200 rounded-md" />
          <div className="h-8 flex-1 bg-gray-100 rounded-md" />
        </div>
      </div>
    </Card>
  )
}

export function TaskQueue({ tasks, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Smart Task Queue</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (tasks.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Smart Task Queue</h2>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
          No pending tasks. All caught up!
        </div>
      </section>
    )
  }

  const urgentCount = tasks.filter((t) => t.priority === 'high' || t.status === 'overdue').length

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-gray-900">Smart Task Queue</h2>
        <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-semibold">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </Badge>
        {urgentCount > 0 && (
          <Badge className="bg-red-100 text-red-800 border border-red-200 font-semibold">
            {urgentCount} urgent
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <SmartTaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  )
}
