import { CheckCircle2, Clock3, FileClock, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PurchaseOrderStatus } from '../types'

export function normalizePoStatus(status?: string | null): string {
  if (!status) return 'draft'
  const s = status.toLowerCase().replace(/[-_\s]/g, '')
  if (s === 'forapproval' || s === 'submitted') return 'for-approval'
  if (s === 'approved') return 'approved'
  if (s === 'returned') return 'returned'
  if (s === 'draft') return 'draft'
  return status.toLowerCase()
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    className: string
    icon: typeof CheckCircle2
  }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-50 text-slate-700 border-slate-300 font-semibold text-xs shadow-2xs',
    icon: FileClock,
  },
  'for-approval': {
    label: 'For Approval',
    className: 'bg-amber-50 text-amber-700 border-amber-300 font-semibold text-xs shadow-2xs',
    icon: Clock3,
  },
  submitted: {
    label: 'For Approval',
    className: 'bg-amber-50 text-amber-700 border-amber-300 font-semibold text-xs shadow-2xs',
    icon: Clock3,
  },
  returned: {
    label: 'Returned',
    className: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold text-xs shadow-2xs',
    icon: RotateCcw,
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-xs shadow-2xs',
    icon: CheckCircle2,
  },
}

export function PurchaseOrderStatusBadge({
  status,
  className,
}: {
  status?: PurchaseOrderStatus | string | null
  className?: string
}) {
  const normKey = normalizePoStatus(status)
  const config = STATUS_CONFIG[normKey] ?? {
    label: status ? String(status) : 'Draft',
    className: 'bg-slate-50 text-slate-700 border-slate-300 font-semibold text-xs shadow-2xs',
    icon: FileClock,
  }
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs whitespace-nowrap',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  )
}

