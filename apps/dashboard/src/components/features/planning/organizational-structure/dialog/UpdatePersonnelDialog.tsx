import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button'
import { UpdatePersonnelForm } from '../form/UpdatePersonnelForm'
import { usePersonnelPosition } from '@/pages/planning/organization/hooks/useOrgUnits'
import type { PositionDropdownItem } from '../types'

interface UpdatePersonnelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personnelId?: string
  availablePositions?: PositionDropdownItem[]
}

function UpdatePersonnelDialog({
  open,
  onOpenChange,
  personnelId,
  availablePositions
}: UpdatePersonnelDialogProps) {
  if (!personnelId) {
    // nothing to edit until an id is provided
    return null
  }
  // load current personnel record for header display
  const { data: personnel } = usePersonnelPosition(personnelId)

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
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (isDirty) {
              e.preventDefault()
              setShowConfirmation(true)
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-default-900 tracking-tight">
              Update Personnel Information{personnel ? ` – ${personnel.firstName} ${personnel.lastName}` : ''}
            </DialogTitle>
            <DialogDescription className="text-default-400 font-medium">
              Modify personnel details and employment information{personnel && personnel.position ? ` for ${personnel.position}` : ''}.
              All required government identification and employment details must be provided.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
            <UpdatePersonnelForm
              personnelId={personnelId!}
              onUpdated={() => {
                onOpenChange(false)
                setIsDirty(false)
              }}
              onClose={() => handleOpenChange(false)}
              isDirtyCallback={setIsDirty}
              availablePositions={availablePositions}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="font-medium h-10 border-default-200 text-default-600 hover:bg-default-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled
              className="font-semibold h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
            >
              Update Personnel
            </Button>
          </div>
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

export default UpdatePersonnelDialog
