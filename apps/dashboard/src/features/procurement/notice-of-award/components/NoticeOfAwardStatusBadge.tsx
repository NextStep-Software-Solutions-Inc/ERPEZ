import { CheckCircle2, Clock3, FileClock, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { NoticeOfAwardStatus } from '../types'

const STATUS_CONFIG: Record<
  NoticeOfAwardStatus,
  {
    label: string
    className: string
    icon: typeof CheckCircle2
  }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-50 text-slate-700 border-slate-300 font-bold text-xs shadow-2xs',
    icon: FileClock,
  },
  'for-approval': {
    label: 'For Approval',
    className: 'bg-sky-50 text-sky-700 border-sky-300 font-bold text-xs shadow-2xs',
    icon: Clock3,
  },
  returned: {
    label: 'Returned',
    className: 'bg-rose-50 text-rose-700 border-rose-300 font-bold text-xs shadow-2xs',
    icon: RotateCcw,
  },
  approved: {
    label: 'Approved / Issued',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-xs shadow-2xs',
    icon: CheckCircle2,
  },
}

export function NoticeOfAwardStatusBadge({
  status,
}: {
  status: NoticeOfAwardStatus
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  const Icon = config.icon

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1 shrink-0" />
      {config.label}
    </Badge>
  )
}

