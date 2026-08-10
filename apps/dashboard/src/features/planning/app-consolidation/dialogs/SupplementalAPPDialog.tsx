import { useState, useCallback } from 'react'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { supplementalAPPDialogOpenAtom, supplementalPPMPSelectionDialogOpenAtom, supplementalMetadataAtom, currentAppAtom } from '../atoms'
import { type SupplementalMetadataFormValues } from '../forms/SupplementalAPPMetadataForm'
import { MetadataStep } from '../components/MetadataStep'

const SUPPLEMENTAL_METADATA_STORAGE_KEY = 'supplemental_app_metadata'

export function SupplementalAPPDialog() {
  const [dialogOpen, setDialogOpen] = useAtom(supplementalAPPDialogOpenAtom)
  const currentApp = useAtomValue(currentAppAtom)
  const setSuplementalPPMPDialogOpen = useSetAtom(supplementalPPMPSelectionDialogOpenAtom)
  const setSupplementalMetadata = useSetAtom(supplementalMetadataAtom)

  const [isMetadataFormLoading, setIsMetadataFormLoading] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

  const handleMetadataSubmit = async (values: SupplementalMetadataFormValues) => {
    setIsMetadataFormLoading(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Save metadata to atom for PPMP selection dialog
      setSupplementalMetadata(values)

      // Persist metadata to localStorage for recovery if dialog is closed unexpectedly
      try {
        localStorage.setItem(SUPPLEMENTAL_METADATA_STORAGE_KEY, JSON.stringify(values))
      } catch (error) {
        console.warn('Failed to save metadata to localStorage:', error)
      }

      // Close metadata dialog
      setDialogOpen(false)

      // Open PPMP selection dialog
      setTimeout(() => {
        setSuplementalPPMPDialogOpen(true)
      }, 100)

      toast.success('Metadata saved. Opening PPMP selection...')
    } catch (error) {
      console.error('Error saving metadata:', error)
      toast.error('Failed to save metadata')
    } finally {
      setIsMetadataFormLoading(false)
    }
  }

  const handleClose = useCallback(() => {
    if (isMetadataFormLoading) {
      return
    }
    setDialogOpen(false)
  }, [isMetadataFormLoading, setDialogOpen])

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (open) {
      setDialogOpen(true)
    } else {
      // Clear cache and local storage when dialog closes without completion
      handleClose()
      // Optionally clear localStorage if user cancels
      // This will be cleared after PPMP selection completes
    }
  }, [setDialogOpen, handleClose])

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="pointer-events-auto z-[9999] max-h-[90vh] overflow-y-auto" size="lg">
          <DialogHeader>
            <DialogTitle>Create Supplemental APP</DialogTitle>
            <DialogDescription>
              Fill in the supplemental details, quarter, and optionally upload an approval document.
            </DialogDescription>
          </DialogHeader>

          {!currentApp ? (
            <div className="py-6 text-center text-gray-500">
              <p>No APP selected. Please select an APP first.</p>
            </div>
          ) : (
            <MetadataStep app={currentApp} onSubmit={handleMetadataSubmit} isLoading={isMetadataFormLoading} />
          )}

          <DialogFooter className="flex items-center gap-2 pt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isMetadataFormLoading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
        <AlertDialogContent className="z-[99999] pointer-events-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Metadata?</AlertDialogTitle>
            <AlertDialogDescription>Your metadata will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} className="bg-red-600 hover:bg-red-700">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
