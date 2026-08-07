import { useState, useMemo, useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
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
import { supplementalPPMPSelectionDialogOpenAtom, supplementalMetadataAtom, currentAppAtom } from '../atoms'
import {
  extractDeltaItems,
  extractMultiplePPMPDeltas,
  getOriginalPPMPIds,
} from '../handlers/deltaExtraction'
import { PPMPSelectionStep } from '../components/PPMPSelectionStep'
import { buildAmendedPPMPVersions, createSupplementalAppObject } from '../utils'
import type { PPMPVersion } from '../types'

const SUPPLEMENTAL_METADATA_STORAGE_KEY = 'supplemental_app_metadata'

export function SupplementalPPMPSelectionDialog() {
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useAtom(supplementalPPMPSelectionDialogOpenAtom)
  const currentApp = useAtomValue(currentAppAtom)
  const metadataValues = useAtomValue(supplementalMetadataAtom)
  const setSupplementalMetadata = useSetAtom(supplementalMetadataAtom)

  const [selectedVersionIds, setSelectedVersionIds] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

  const allAmendedVersions = useMemo(() => buildAmendedPPMPVersions(), [])
  const eligiblePPMPIds = currentApp ? getOriginalPPMPIds(currentApp) : []
  const availableAmendedPPMPs = useMemo(
    () => allAmendedVersions.filter((v: PPMPVersion) => eligiblePPMPIds.includes(v.ppmpId)),
    [allAmendedVersions, eligiblePPMPIds]
  )

  const handleCreateSupplemental = async () => {
    if (selectedVersionIds.size === 0 || !currentApp || !metadataValues) {
      toast.error('Missing required data')
      return
    }

    setIsCreating(true)
    try {
      const selectedVersions = availableAmendedPPMPs.filter((v: PPMPVersion) => selectedVersionIds.has(v.id))
      const deltaResult =
        selectedVersions.length === 1
          ? extractDeltaItems(currentApp, { items: selectedVersions[0].items } as any, selectedVersions[0].label)
          : extractMultiplePPMPDeltas(currentApp, selectedVersions.map((v: PPMPVersion) => ({ data: { items: v.items } as any, label: v.label })))

      if (deltaResult.deltaItems.length === 0) {
        toast.error('No delta items found')
        setIsCreating(false)
        return
      }

      const deltaResultWithLabels = {
        ...deltaResult,
        amendedPPMPLabels: selectedVersions.map((v: PPMPVersion) => v.label),
      }

      const supplemental = createSupplementalAppObject(
        currentApp,
        selectedVersions,
        deltaResultWithLabels,
        metadataValues,
        eligiblePPMPIds
      )

      await new Promise((resolve) => setTimeout(resolve, 500))
      navigate({
        to: '/v2/app-consolidation/supplemental/$supplementalId',
        params: { supplementalId: supplemental.id },
        state: { supplementalApp: supplemental },
      } as any)

      setDialogOpen(false)
      setSelectedVersionIds(new Set())
      
      // Clear cache and localStorage after successful creation
      try {
        localStorage.removeItem(SUPPLEMENTAL_METADATA_STORAGE_KEY)
        setSupplementalMetadata(null)
      } catch (error) {
        console.warn('Failed to clear metadata from cache/storage:', error)
      }

      toast.success(
        `Supplemental APP created (${metadataValues.quarter}) with ${deltaResult.deltaItems.length} delta items!`
      )
    } catch (error) {
      console.error('Error creating supplemental APP:', error)
      toast.error('Failed to create supplemental APP')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = useCallback(() => {
    if (selectedVersionIds.size > 0) {
      setShowCancelConfirmation(true)
    } else {
      setDialogOpen(false)
    }
  }, [selectedVersionIds, setDialogOpen])

  const handleReset = useCallback(() => {
    setDialogOpen(false)
    setSelectedVersionIds(new Set())
    setShowCancelConfirmation(false)
    
    // Clear cache and localStorage when user cancels
    try {
      localStorage.removeItem(SUPPLEMENTAL_METADATA_STORAGE_KEY)
      setSupplementalMetadata(null)
    } catch (error) {
      console.warn('Failed to clear metadata from cache/storage:', error)
    }
  }, [setDialogOpen, setSupplementalMetadata])

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (open) {
      setDialogOpen(true)
    } else {
      handleClose()
    }
  }, [setDialogOpen, handleClose])

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="pointer-events-auto z-[9999] overflow-visible max-h-[90vh] overflow-y-auto" size="lg">
          <DialogHeader>
            <DialogTitle>Select Amended PPMPs</DialogTitle>
            <DialogDescription>
              {metadataValues && <span>Quarter: <strong>{metadataValues.quarter}</strong></span>}
            </DialogDescription>
          </DialogHeader>

          {!currentApp ? (
            <div className="py-6 text-center text-gray-500">
              <p>No APP selected. Please try again.</p>
            </div>
          ) : availableAmendedPPMPs.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              <p>No amended PPMPs found for this APP.</p>
            </div>
          ) : (
            <PPMPSelectionStep
              app={currentApp}
              quarter={metadataValues?.quarter}
              availableVersions={availableAmendedPPMPs}
              selectedVersionIds={selectedVersionIds}
              onToggleVersion={(id) => {
                const newSelected = new Set(selectedVersionIds)
                newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id)
                setSelectedVersionIds(newSelected)
              }}
              isDisabled={isCreating}
            />
          )}

          <DialogFooter className="flex items-center gap-2 pt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSupplemental}
              disabled={isCreating || selectedVersionIds.size === 0 || !currentApp || !metadataValues}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? 'Creating...' : 'Create & Configure'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
        <AlertDialogContent className="z-[99999] pointer-events-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Selections?</AlertDialogTitle>
            <AlertDialogDescription>Your PPMP selections will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
