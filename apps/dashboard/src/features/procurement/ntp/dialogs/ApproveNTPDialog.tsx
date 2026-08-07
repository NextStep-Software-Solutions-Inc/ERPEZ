/**
 * Approve NTP Dialog
 * Dialog wrapper for approving an NTP
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
import { ApproveNTPForm } from '../forms/ApproveNTPForm'
import { mockNTPStore } from '../utils/mockNTPStore'
import { isApproveNTPDialogOpenAtom, targetNTPIdAtom } from '../atoms/ntpAtoms'
import type { ApproveNTPFormValues } from '../types/ntpTypes'

export interface ApproveNTPDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ApproveNTPDialog({ open, onOpenChange }: ApproveNTPDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useAtom(isApproveNTPDialogOpenAtom)
  const [targetNTPId] = useAtom(targetNTPIdAtom)

  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const dialogOpen = open !== undefined ? open : isDialogOpen
  const handleDialogOpen = useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setIsDialogOpen(newOpen)
      }
    },
    [isDialogOpen, onOpenChange, setIsDialogOpen]
  )

  // Reset state when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setIsDirty(false)
    }
  }, [dialogOpen])

  // Handle dialog close with unsaved changes check
  const handleCloseDialog = useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true)
    } else {
      handleDialogOpen(false)
    }
  }, [isDirty, handleDialogOpen])



  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (payload: ApproveNTPFormValues) => {
      if (!targetNTPId) throw new Error('NTP ID not found')
      if (!payload.signedDocument) throw new Error('Signed document is required')
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('signedDocument', payload.signedDocument)
      formData.append('approvedBy', payload.approvedBy)
      if (payload.approvalRemarks) {
        formData.append('approvalRemarks', payload.approvalRemarks)
      }
      return mockNTPStore.approve({
        ntpId: targetNTPId,
        signedDocument: payload.signedDocument,
        approvedBy: payload.approvedBy,
        approvalRemarks: payload.approvalRemarks,
        approvedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      setIsDirty(false)
      handleDialogOpen(false)
      // Trigger refetch would go here in real scenario
      window.location.reload()
    },
    onError: (error) => {
      console.error('Failed to approve NTP:', error)
    },
  })

  const handleFormSubmit = useCallback(
    (values: ApproveNTPFormValues) => {
      approveMutation.mutate(values)
    },
    [approveMutation]
  )

  const handleConfirmClose = useCallback(() => {
    setShowUnsavedWarning(false)
    setIsDirty(false)
    handleDialogOpen(false)
  }, [handleDialogOpen])

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Notice to Proceed</DialogTitle>
            <DialogDescription>
              Review and approve the NTP. Upload the signed document and provide your name.
            </DialogDescription>
          </DialogHeader>

          <ApproveNTPForm
            isSubmitting={approveMutation.isPending}
            onSubmit={handleFormSubmit}
            onDirtyStateChange={setIsDirty}
          />
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without approving?
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
