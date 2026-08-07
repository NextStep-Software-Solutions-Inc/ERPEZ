import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ToggleUnitOfMeasurementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uomName: string
  isActive: boolean
  onConfirm: () => void
  isLoading?: boolean
}

export function ToggleUnitOfMeasurementDialog({
  open,
  onOpenChange,
  uomName,
  isActive,
  onConfirm,
  isLoading = false,
}: ToggleUnitOfMeasurementDialogProps) {
  const action = isActive ? 'deactivate' : 'activate'
  const actionColor = isActive ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-green-600 text-white hover:bg-green-700'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Deactivate' : 'Activate'} Unit of Measurement
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action} <span className="font-semibold text-foreground">{uomName}</span>?
            {isActive
              ? ' This unit will no longer be available for new procurements.'
              : ' This unit will become available for new procurements.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="bg-white text-foreground hover:bg-gray-100 border border-gray-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={actionColor}
          >
            {isLoading ? `${isActive ? 'Deactivating' : 'Activating'}...` : isActive ? 'Deactivate' : 'Activate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}