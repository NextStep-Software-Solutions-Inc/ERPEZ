/**
 * Create NTP Dialog
 * Dialog wrapper for creating a new NTP
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
import { CreateNTPForm } from '../forms/CreateNTPForm'
import { LinkSourceDocumentModal } from './LinkSourceDocumentModal'
import { mockNTPStore } from '../utils/mockNTPStore'
import { isCreateNTPDialogOpenAtom, isLinkSourceDocumentModalOpenAtom } from '../atoms/ntpAtoms'
import type { CreateNTPFormValues, ApprovedPOForNTP, ApprovedContractForNTP } from '../types/ntpTypes'
import { NTPSourceType } from '../types/ntpTypes'

export interface CreateNTPDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateNTPDialog({ open, onOpenChange }: CreateNTPDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useAtom(isCreateNTPDialogOpenAtom)
  const [, setIsLinkModalOpen] = useAtom(isLinkSourceDocumentModalOpenAtom)
  
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [selectedSourceDoc, setSelectedSourceDoc] = useState<ApprovedPOForNTP | ApprovedContractForNTP | null>(null)
  const [selectedSourceType, setSelectedSourceType] = useState<'PO' | 'Contract' | undefined>(undefined)

  const dialogOpen = open !== undefined ? open : isDialogOpen
  const handleDialogOpen = useCallback((newOpen: boolean) => {
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
  }, [isDirty, isDialogOpen, onOpenChange, setIsDialogOpen])

  // Reset state when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setIsDirty(false)
      setSelectedSourceDoc(null)
      setSelectedSourceType(undefined)
    }
  }, [dialogOpen])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: CreateNTPFormValues) => {
      const sourceType = payload.sourceType === 'PO' ? NTPSourceType.PO : NTPSourceType.CONTRACT
      return mockNTPStore.create({
        ntpNumber: payload.ntpNumber,
        description: payload.description,
        date: payload.date,
        sourceType,
        sourceDocumentId: payload.sourceDocumentId,
      })
    },
    onSuccess: () => {
      setIsDirty(false)
      handleDialogOpen(false)
      // Trigger refetch would go here in real scenario
      window.location.reload()
    },
    onError: (error) => {
      console.error('Failed to create NTP:', error)
    },
  })

  const handleSelectSourceDocument = useCallback(() => {
    setIsLinkModalOpen(true)
    setIsDirty(true)
  }, [setIsLinkModalOpen])

  const handleSourceDocumentSelected = useCallback(
    (sourceDoc: ApprovedPOForNTP | ApprovedContractForNTP, type: 'PO' | 'Contract') => {
      setSelectedSourceDoc(sourceDoc)
      setSelectedSourceType(type)
      setIsDirty(true)
      // Close modal after selection
      setIsLinkModalOpen(false)
    },
    [setIsLinkModalOpen]
  )

  const handleFormSubmit = useCallback(
    (values: CreateNTPFormValues) => {
      createMutation.mutate(values)
    },
    [createMutation]
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
            <DialogTitle>Create Notice to Proceed</DialogTitle>
            <DialogDescription>
              Create a new NTP by selecting a PO or Contract and entering the NTP details.
            </DialogDescription>
          </DialogHeader>

          <CreateNTPForm
            selectedSourceDoc={selectedSourceDoc}
            sourceType={selectedSourceType}
            isSubmitting={createMutation.isPending}
            onSelectSourceDocument={handleSelectSourceDocument}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* Link Source Document Modal */}
      <LinkSourceDocumentModal onSourceSelected={handleSourceDocumentSelected} />

      {/* Unsaved Changes Warning */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose} className="bg-red-600 hover:bg-red-700">
              Discard
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
