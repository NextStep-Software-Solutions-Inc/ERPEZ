import { FileText } from 'lucide-react'
import {
  BacResolutionExecutionBadges,
  BacResolutionStatusBadge,
} from '../../bac-resolution/components'
import type { BacResolution } from '../../bac-resolution/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPrimaryLinkedConsolidatedPr } from '../../bac-resolution/utils/bacResolutionWorkflow'

interface BiddingScheduleResolutionBannerProps {
  bacResolution: BacResolution
}

function formatModeOfProcurement(bacResolution: BacResolution) {
  const uniqueModes = Array.from(
    new Set(
      bacResolution.linkedConsolidatedPrs.map((item) => item.modeOfProcurement),
    ),
  )

  return uniqueModes.length > 0 ? uniqueModes.join(' / ') : '—'
}

export function BiddingScheduleResolutionBanner({
  bacResolution,
}: BiddingScheduleResolutionBannerProps) {
  const linkedPr = getPrimaryLinkedConsolidatedPr(bacResolution)

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            {bacResolution.bacResolutionNumber}
          </CardTitle>
          <BacResolutionStatusBadge status={bacResolution.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {bacResolution.description}
        </p>
        <BacResolutionExecutionBadges resolution={bacResolution} />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Resolution Date
          </p>
          <p className="mt-1 font-medium">{bacResolution.resolutionDate}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Owning Consolidated PR
          </p>
          <p className="mt-1 font-medium">
            {linkedPr?.prNumber ?? 'Not linked yet'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Total Amount
          </p>
          <p className="mt-1 font-medium">
            ₱{bacResolution.totalAmount.toLocaleString('en-PH')}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Mode of Procurement
          </p>
          <Badge variant="outline" className="mt-1">
            {formatModeOfProcurement(bacResolution)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
