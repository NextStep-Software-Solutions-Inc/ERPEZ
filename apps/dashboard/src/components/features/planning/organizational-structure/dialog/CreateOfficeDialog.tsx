import React, { useState } from 'react'
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
import { CreateOfficeForm } from '../form/CreateOfficeForm'
import type { OrgUnit } from '@/services/mock/orgUnits'
import type { OfficeV2 } from '../types'

interface CreateOfficeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentUnits?: OrgUnit[]
  organizationId?: string
}

function CreateOfficeDialog({ open, onOpenChange, parentUnits, organizationId }: CreateOfficeDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const isDirtyRef = React.useRef(isDirty)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close and form is dirty, show confirmation instead
    if (!newOpen && isDirtyRef.current) {
      setShowConfirmation(true)
      return // Don't actually close the dialog
    }
    // Otherwise, proceed with the open change
    onOpenChange(newOpen)
    setIsDirty(false)
    isDirtyRef.current = false
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
            if (isDirtyRef.current) {
              e.preventDefault()
              setShowConfirmation(true)
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 bg-default-50/50 border-b">
            <DialogTitle className="text-xl font-semibold text-default-900">Create New Office</DialogTitle>
            <DialogDescription className="text-sm font-medium text-default-500 mt-1">
              Establish a new organizational unit within the agency structure.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
            <CreateOfficeForm
              onCreated={() => {
                onOpenChange(false)
                setIsDirty(false)
                isDirtyRef.current = false
              }}
              onClose={() => handleOpenChange(false)}
              parentUnits={parentUnits?.map((u) => ({ ...u, category: u.category ?? 'administrative' })) as OfficeV2[]}
              isDirtyCallback={(d) => {
                setIsDirty(d)
                isDirtyRef.current = d
              }}
              organizationId={organizationId}
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

export default CreateOfficeDialog