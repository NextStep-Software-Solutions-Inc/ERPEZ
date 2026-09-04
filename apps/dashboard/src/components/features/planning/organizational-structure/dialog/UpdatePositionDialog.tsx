import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { usePosition } from '@/pages/planning/organization/hooks/useOrgUnits'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { UpdatePositionForm } from '../form/UpdatePositionForm'

interface UpdatePositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  positionId?: string
}

function UpdatePositionDialog({ open, onOpenChange, positionId }: UpdatePositionDialogProps) {
  if (!positionId) {
    // nothing to edit until an id is provided
    return null
  }
  // fetch the position for header/context
  const positionQuery = usePosition(positionId)
  const position = positionQuery.data

  const [isDirty, setIsDirty] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty) {
      setShowConfirmation(true)
      return
    }
    onOpenChange(newOpen)
    setIsDirty(false)
  }

  const handleConfirmDiscard = () => {
    setShowConfirmation(false)
    setIsDirty(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-xl"
          onInteractOutside={(e) => {
            if (isDirty) {
              e.preventDefault()
              setShowConfirmation(true)
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 bg-default-50/50 border-b">
            <DialogTitle className="text-xl font-semibold text-default-900">
              Update Position Details{position ? ` – ${position.title}` : ''}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-default-500 mt-1">
              {position
                ? `Modify plantilla position information for ${position.title} (${position.code}) and organizational allocation.`
                : 'Modify plantilla position information and organizational allocation.'}
            </DialogDescription>
          </DialogHeader>

          {positionQuery.isLoading || !position ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin h-6 w-6 text-default-500" />
            </div>
          ) : (
            <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
              <UpdatePositionForm
                key={position.id}
                positionId={positionId}
                position={position}
                onUpdated={() => {
                  onOpenChange(false)
                  setIsDirty(false)
                }}
                onClose={() => handleOpenChange(false)}
                isDirtyCallback={setIsDirty}
              />
            </div>
          )}

        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them and close this dialog?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default UpdatePositionDialog
