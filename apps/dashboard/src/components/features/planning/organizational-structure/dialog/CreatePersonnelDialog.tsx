import React, { useState } from 'react'
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
import { CreatePersonnelForm } from '../form/CreatePersonnelForm'
import type { PositionDropdownItem } from '../types'

interface CreatePersonnelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availablePositions?: PositionDropdownItem[]
  selectedPositionId?: string
}

function CreatePersonnelDialog({
  open,
  onOpenChange,
  availablePositions,
  selectedPositionId
}: CreatePersonnelDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const isDirtyRef = React.useRef(isDirty)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirtyRef.current) {
      setShowConfirmation(true)
      return
    }
    onOpenChange(newOpen)
    setIsDirty(false)
    isDirtyRef.current = false
  }

  const handleConfirmDiscard = () => {
    setShowConfirmation(false)
    setIsDirty(false)
    onOpenChange(false)
  }

  const handleCreated = () => {
    onOpenChange(false)
    setIsDirty(false)
  }

  const handleClose = () => {
    handleOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (isDirtyRef.current) {
              e.preventDefault()
              setShowConfirmation(true)
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-default-900 tracking-tight">
              Assign Personnel to Position
            </DialogTitle>
            <DialogDescription className="text-default-400 font-medium">
              Create a new personnel record and assign them to an available position.
              All required government identification and employment details must be provided.
            </DialogDescription>
          </DialogHeader>

          <CreatePersonnelForm
            onCreated={handleCreated}
            onClose={handleClose}
            availablePositions={availablePositions}
            selectedPositionId={selectedPositionId}
            isDirtyCallback={(d) => {
              setIsDirty(d)
              isDirtyRef.current = d
            }}
          />
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

export default CreatePersonnelDialog