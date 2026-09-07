import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface LockScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function LockScheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: LockScheduleDialogProps) {
  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Lock Bidding Schedule"
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
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Locking…' : 'Lock Schedule'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium">
            Locking is irreversible. Once locked, no milestone dates can be modified, overridden, or regenerated under any circumstances.
          </p>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Please confirm that all milestone dates and requirements have been legally verified according to RA 9184 before proceeding.
        </p>
      </div>
    </ResponsiveDialogDashtail>
  )
}
