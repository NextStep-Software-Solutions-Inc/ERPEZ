import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import type { BiddingMilestone } from '../types'

interface MilestoneCompletionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  milestone: BiddingMilestone | null
  completed: boolean
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function MilestoneCompletionConfirmDialog({
  open,
  onOpenChange,
  milestone,
  completed,
  onConfirm,
  isLoading = false,
}: MilestoneCompletionConfirmDialogProps) {
  if (!milestone) return null

  const title = completed ? 'Mark Milestone Complete' : 'Revert Milestone to Incomplete'
  const actionLabel = completed ? 'Mark Completed' : 'Revert to Incomplete'

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      showCloseButton
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Updating…' : actionLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2.5 rounded-md border border-default-200 bg-muted/30 p-3">
          {completed ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success mt-0.5" />
          ) : (
            <RotateCcw className="h-5 w-5 shrink-0 text-warning mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-semibold text-default-800">{milestone.name}</p>
            <p className="text-muted-foreground">
              Scheduled Date:{' '}
              <span className="font-mono">
                {milestone.overrideDate ?? milestone.computedDate}
              </span>
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {completed
            ? 'Are you sure you want to mark this bidding milestone as completed? This timestamp and your user name will be recorded in the audit trail.'
            : 'Are you sure you want to revert this milestone back to pending? The completed timestamp will be cleared.'}
        </p>
      </div>
    </ResponsiveDialogDashtail>
  )
}
