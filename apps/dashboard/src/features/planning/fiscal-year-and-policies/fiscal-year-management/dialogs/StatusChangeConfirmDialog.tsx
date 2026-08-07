import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types'
import { formatStatusText } from '../utils/validation'

interface StatusChangeConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingChange: {
    fiscalYear: FiscalYear
    newStatus: FiscalYear['status']
  } | null
  warning: string
  onConfirm: () => void
}

/**
 * Dialog component for confirming fiscal year status changes
 */
export function StatusChangeConfirmDialog({
  open,
  onOpenChange,
  pendingChange,
  warning,
  onConfirm,
}: StatusChangeConfirmDialogProps) {
  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Status Change"
      description={warning}
      size="sm"
    >
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          {pendingChange && (
            <>
              Changing FY {pendingChange.fiscalYear.year} from{' '}
              <span className="font-semibold text-foreground">
                {formatStatusText(pendingChange.fiscalYear.status)}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-primary">
                {formatStatusText(pendingChange.newStatus)}
              </span>
            </>
          )}
        </p>

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Change</Button>
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
