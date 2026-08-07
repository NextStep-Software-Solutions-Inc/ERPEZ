import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import type { APRStatus, APRMaster } from '@/features/procurement/apr/types'

interface APRStatusInfoProps {
  status: APRStatus
  apr: APRMaster
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  FOR_APPROVAL: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: 'Pending Approval',
  },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  RETURNED: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'Returned',
  },
  PARTIALLY_AVAILABLE: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    label: 'Partially Available',
  },
  OUT_OF_STOCK: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'Out of Stock',
  },
}

export function APRStatusInfo({ status, apr }: APRStatusInfoProps) {
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.DRAFT
  
  // Select the appropriate timestamp based on status
  const getStatusTimestamp = (): string => {
    switch (status) {
      case 'APPROVED':
        return apr.approvedAt || apr.updatedAt
      case 'FOR_APPROVAL':
        return apr.submittedAt || apr.updatedAt
      case 'RETURNED':
        return apr.returnedAt || apr.updatedAt
      case 'DRAFT':
      default:
        return apr.createdAt
    }
  }
  
  const statusTimestamp = new Date(getStatusTimestamp())
  const dateTime = statusTimestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Current Status</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                {statusConfig.label}
              </Badge>
              <span className="text-xs text-gray-500">{dateTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
