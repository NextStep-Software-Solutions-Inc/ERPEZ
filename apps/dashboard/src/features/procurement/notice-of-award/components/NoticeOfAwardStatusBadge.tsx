import { Badge } from '@/components/ui/badge'
import type { NoticeOfAwardStatus } from '../types'

const STATUS_VARIANTS: Record<NoticeOfAwardStatus, string> = {
  draft: 'border border-border/80 text-foreground bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal',
  'for-approval': 'border border-sky-500 text-sky-600 dark:text-sky-400 bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal',
  returned: 'border border-rose-500 text-rose-600 dark:text-rose-400 bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal',
  approved: 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal',
}

const STATUS_LABELS: Record<NoticeOfAwardStatus, string> = {
  draft: 'Draft',
  'for-approval': 'For Approval',
  returned: 'Returned',
  approved: 'Approved',
}

export function NoticeOfAwardStatusBadge({
  status,
}: {
  status: NoticeOfAwardStatus
}) {
  return (
    <Badge variant="outline" className={STATUS_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

