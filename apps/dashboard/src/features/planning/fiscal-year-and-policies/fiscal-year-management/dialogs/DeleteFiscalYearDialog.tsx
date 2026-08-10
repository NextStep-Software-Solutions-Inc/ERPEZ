import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types'

interface DeleteFiscalYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiscalYear: FiscalYear | null
  onConfirm: () => void
  isLoading?: boolean
}

/**
 * Dialog component for confirming deletion of a fiscal year
 */
export function DeleteFiscalYearDialog({
  open,
  onOpenChange,
  fiscalYear,
  onConfirm,
  isLoading = false,
}: DeleteFiscalYearDialogProps) {
  if (!fiscalYear) return null

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Fiscal Year"
      description={`Are you sure you want to delete FY ${fiscalYear.year}?`}
      size="sm"
    >
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          This will permanently delete the fiscal year and all associated months
          and data. This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 pt-6">
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
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
