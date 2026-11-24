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
import { UpdateOfficeForm } from '../form/UpdateOfficeForm'
import { useOrgUnit } from '@/pages/planning/organization/hooks/useOrgUnits'
import type { OrgUnit } from '@/services/mock/orgUnits'

interface UpdateOfficeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit?: OrgUnit | null
  unitId?: string | null
}

function UpdateOfficeDialog({
  open,
  onOpenChange,
  unit: propUnit,
  unitId,
}: UpdateOfficeDialogProps) {
  const { data: fetchedUnit } = useOrgUnit(propUnit ? null : (unitId ?? null))
  const unit = propUnit || fetchedUnit || null

  const [isDirty, setIsDirty] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  if (!unit) return null

  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close and form is dirty, show confirmation instead
    if (!newOpen && isDirty) {
      setShowConfirmation(true)
      return // Don't actually close the dialog
    }
    // Otherwise, proceed with the open change
    onOpenChange(newOpen)
    setIsDirty(false)
  }

  const handleConfirmDiscard = () => {
    setShowConfirmation(false)
    setIsDirty(false)
    onOpenChange(false) // Now actually close the dialog
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-xl"
          onInteractOutside={(e) => {
            // If form is dirty, prevent closing on overlay click
            if (isDirty) {
              e.preventDefault()
              setShowConfirmation(true)
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 bg-default-50/50 border-b">
            <DialogTitle className="text-xl font-semibold text-default-900">
              Modify Office Details
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-default-500 mt-1">
              Update organizational unit information, metadata, and satellite
              details.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
            <UpdateOfficeForm
              unit={unit}
              onUpdated={() => {
                onOpenChange(false)
                setIsDirty(false)
              }}
              onClose={() => handleOpenChange(false)}
              isDirtyCallback={setIsDirty}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them
              and close this dialog?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default UpdateOfficeDialog
