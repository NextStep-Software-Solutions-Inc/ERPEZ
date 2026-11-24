import { CheckCircle2, XCircle, Upload, ClipboardList } from 'lucide-react'
import type { DAStatus } from '../types/direct-contracting-item-type'

export const STATUS_CONFIG: Record<
  DAStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  pending_receipt: {
    label: 'Pending Receipt',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: <Upload className="h-3 w-3 mr-1" />,
  },
  for_review: {
    label: 'For Review',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: <ClipboardList className="h-3 w-3 mr-1" />,
  },
  approved: {
    label: 'Approved',
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700 border-red-300',
    icon: <XCircle className="h-3 w-3 mr-1" />,
  },
}
