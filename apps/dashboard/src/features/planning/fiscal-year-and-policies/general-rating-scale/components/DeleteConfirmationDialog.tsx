import { AlertTriangle, Loader2 } from 'lucide-react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scaleName: string
  isLoading?: boolean
  onConfirm: () => void
}

/**
 * DeleteConfirmationDialog - Modal for confirming deletion of a rating scale
 *
 * Responsibilities:
 * - Display warning message with scale name
 * - Show loading state during deletion
 * - Provide confirm/cancel actions
 */
export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  scaleName,
  isLoading = false,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Rating Scale"
      description={`Are you sure you want to delete ${scaleName}? This action cannot be undone.`}
      size="sm"
      footer={
        <>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="destructive"
            className="flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </>
      }
    >
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-red-900">
              Rating scale to be deleted
            </h3>
            <p className="text-sm text-red-800">
              <strong className="font-semibold">{scaleName}</strong>
            </p>
            <p className="text-sm text-red-700/90">
              This action cannot be undone. All references to this rating scale
              will be removed.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
