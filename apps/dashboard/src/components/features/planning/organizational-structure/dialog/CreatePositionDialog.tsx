import { useState } from 'react'
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
import { CreatePositionForm } from '../form/CreatePositionForm'


interface CreatePositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOrgUnitId?: string
}

function CreatePositionDialog({ open, onOpenChange, selectedOrgUnitId }: CreatePositionDialogProps) {
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
            <DialogTitle className="text-xl font-semibold text-default-900">Create New Position</DialogTitle>
            <DialogDescription className="text-sm font-medium text-default-500 mt-1">
              Add a new plantilla position to the organizational structure.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
            <CreatePositionForm
              onCreated={() => {
                onOpenChange(false)
                setIsDirty(false)
              }}
              onClose={() => handleOpenChange(false)}
              selectedOrgUnitId={selectedOrgUnitId}
              isDirtyCallback={setIsDirty}
            />
          </div>
        </DialogContent>

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
      </Dialog>
    </>
  )
}

export default CreatePositionDialog
