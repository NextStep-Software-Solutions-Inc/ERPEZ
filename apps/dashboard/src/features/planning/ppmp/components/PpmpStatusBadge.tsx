/**
 * PpmpStatusBadge
 * Visual status chip for PPMP state display across all list and detail views.
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PPMPState, ApprovalRole } from '../types'

const STATE_CONFIG: Record<PPMPState, { label: string; className: string }> = {
  [PPMPState.DRAFT]: {
    label: 'Draft',
    className: 'bg-default-200 text-default-700 hover:bg-default-200',
  },
  [PPMPState.PENDING_REVIEW]: {
    label: 'Pending Review',
    className: 'bg-warning/20 text-warning hover:bg-warning/20',
  },
  [PPMPState.APPROVED]: {
    label: 'Approved',
    className: 'bg-success/20 text-success hover:bg-success/20',
  },
  [PPMPState.AMENDING]: {
    label: 'Amending',
    className: 'bg-info/20 text-info hover:bg-info/20',
  },
  [PPMPState.SUPERSEDED]: {
    label: 'Superseded',
    className: 'bg-muted text-muted-foreground hover:bg-muted',
  },
  [PPMPState.CONSOLIDATED]: {
    label: 'Consolidated',
    className: 'bg-secondary text-secondary-foreground hover:bg-secondary',
  },
  [PPMPState.REJECTED]: {
    label: 'Rejected',
    className: 'bg-destructive/20 text-destructive hover:bg-destructive/20',
  },
}

const STAGE_LABELS: Record<ApprovalRole, string> = {
  [ApprovalRole.BUDGET_OFFICER]: 'Awaiting: Budget Officer',
  [ApprovalRole.BAC_SECRETARIAT]: 'Awaiting: BAC Secretariat',
  [ApprovalRole.HOPE]: 'Awaiting: HoPE',
}

interface PpmpStatusBadgeProps {
  state: PPMPState
  currentApprovalStage?: ApprovalRole | null
  className?: string
}

export function PpmpStatusBadge({
  state,
  currentApprovalStage,
  className,
}: PpmpStatusBadgeProps) {
  const config = STATE_CONFIG[state]
  if (!config) {
    return null
  }

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <Badge className={cn('text-xs font-medium', config.className)}>
        {config.label}
      </Badge>
      {state === PPMPState.PENDING_REVIEW && currentApprovalStage && (
        <span className="text-[10px] text-muted-foreground">
          {STAGE_LABELS[currentApprovalStage]}
        </span>
      )}
    </div>
  )
}
