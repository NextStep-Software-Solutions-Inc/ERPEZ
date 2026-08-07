import { Badge } from '@/components/ui/badge'
import type { NoticeOfAwardStatus } from '../types'

const STATUS_VARIANTS: Record<NoticeOfAwardStatus, string> = {
  draft: 'border border-default-300 bg-default-100 text-default-700',
  'for-approval': 'border border-amber-300 bg-amber-50 text-amber-700',
  returned: 'border border-rose-300 bg-rose-50 text-rose-700',
  approved: 'border border-emerald-300 bg-emerald-50 text-emerald-700',
}

const STATUS_LABELS: Record<NoticeOfAwardStatus, string> = {
  draft: 'Draft',
  'for-approval': 'For Approval',
  returned: 'Returned',
  approved: 'Approved / Issued',
}

export function NoticeOfAwardStatusBadge({
  status,
}: {
  status: NoticeOfAwardStatus
}) {
  return (
    <Badge className={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  )
}
