/**
 * Return NTP Dialog
 * Dialog wrapper for returning an NTP
 * Includes unsaved changes protection
 */

import { useCallback, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { useMutation } from '@tanstack/react-query'
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
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ReturnNTPForm } from '../forms/ReturnNTPForm'
import { mockNTPStore } from '../utils/mockNTPStore'
import { isReturnNTPDialogOpenAtom, targetNTPIdAtom } from '../atoms/ntpAtoms'
import type { ReturnNTPFormValues } from '../types/ntpTypes'

export interface ReturnNTPDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ReturnNTPDialog({ open, onOpenChange }: ReturnNTPDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useAtom(isReturnNTPDialogOpenAtom)
  const [targetNTPId] = useAtom(targetNTPIdAtom)

  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const dialogOpen = open !== undefined ? open : isDialogOpen
  const handleDialogOpen = useCallback(
    (newOpen: boolean) => {
      // Check for unsaved changes when closing
      if (!newOpen && isDirty) {
        setShowUnsavedWarning(true)
        return
      }

      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setIsDialogOpen(newOpen)
      }
    },
    [isDirty, isDialogOpen, onOpenChange, setIsDialogOpen]
  )

  // Reset state when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setIsDirty(false)
    }
  }, [dialogOpen])

  // Return mutation
  const returnMutation = useMutation({
    mutationFn: async (payload: ReturnNTPFormValues) => {
      if (!targetNTPId) throw new Error('NTP ID not found')
      return mockNTPStore.return({
        ntpId: targetNTPId,
        reason: payload.returnReason,
        remarks: payload.returnRemarks,
        returnedBy: 'Current User', // TODO: Get from auth context
        returnedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      setIsDirty(false)
      handleDialogOpen(false)
      // Trigger refetch would go here in real scenario
      window.location.reload()
    },
    onError: (error) => {
      console.error('Failed to return NTP:', error)
    },
  })

  const handleFormSubmit = useCallback(
    (values: ReturnNTPFormValues) => {
      setIsDirty(true)
      returnMutation.mutate(values)
    },
    [returnMutation]
  )

  const handleConfirmClose = useCallback(() => {
    setShowUnsavedWarning(false)
    setIsDirty(false)
    handleDialogOpen(false)
  }, [handleDialogOpen])

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Notice to Proceed</DialogTitle>
            <DialogDescription>
              Specify the reason for return and provide detailed remarks for the procuring unit.
            </DialogDescription>
          </DialogHeader>

          <ReturnNTPForm
            isSubmitting={returnMutation.isPending}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without returning?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
