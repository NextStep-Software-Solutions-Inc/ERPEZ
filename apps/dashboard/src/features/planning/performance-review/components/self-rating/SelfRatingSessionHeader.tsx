import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

import { WorkflowStatusBadge } from '../../components/WorkflowStatusBadge'
import type { WorkflowStatus } from '../../types'

interface SelfRatingSessionHeaderProps {
  title: string
  fiscalYear: string
  rateeName: string
  kpiCount: number
  status: WorkflowStatus
  onReturnToSelection: () => void
}

export function SelfRatingSessionHeader({
  title,
  fiscalYear,
  rateeName,
  kpiCount,
  status,
  onReturnToSelection,
}: SelfRatingSessionHeaderProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 px-0 text-muted-foreground hover:text-foreground"
              onClick={onReturnToSelection}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to OPCR List
            </Button>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
              <span>
                Fiscal Year: <strong>{fiscalYear}</strong>
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span>
                Ratee: <strong>{rateeName}</strong>
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span>{kpiCount} KPI items</span>
            </CardDescription>
          </div>
          <WorkflowStatusBadge status={status} />
        </div>
      </CardHeader>
    </Card>
  )
}
