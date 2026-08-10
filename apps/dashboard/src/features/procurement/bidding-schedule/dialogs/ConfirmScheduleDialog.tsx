import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'

interface ConfirmScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function ConfirmScheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: ConfirmScheduleDialogProps) {
  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Bidding Schedule"
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
          <Button onClick={onConfirm} disabled={isLoading}>
            Confirm Schedule
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Are you sure you want to confirm this bidding schedule?</p>
        <p>Once confirmed:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>The Pre-Bidding Document (PBD) finalization will be unblocked.</li>
          <li>Regeneration of the entire schedule will no longer be possible.</li>
          <li>Individual milestone dates can still be edited with justification.</li>
        </ul>
      </div>
    </ResponsiveDialogDashtail>
  )
}
