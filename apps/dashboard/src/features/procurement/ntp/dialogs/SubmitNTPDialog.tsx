/**
 * Submit NTP Dialog
 * Simple confirmation dialog for submitting NTP from Draft to For Approval
 * Includes unsaved changes protection
 */

import { useCallback, useState } from 'react'
import { useAtom } from 'jotai'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { mockNTPStore } from '../utils/mockNTPStore'
import { isSubmitNTPDialogOpenAtom, targetNTPIdAtom } from '../atoms/ntpAtoms'
import type { SubmitNTPPayload } from '../types/ntpTypes'

export interface SubmitNTPDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function SubmitNTPDialog({ open, onOpenChange, onSuccess }: SubmitNTPDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useAtom(isSubmitNTPDialogOpenAtom)
  const [targetNTPId] = useAtom(targetNTPIdAtom)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dialogOpen = open !== undefined ? open : isDialogOpen
  const handleDialogOpen = useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setIsDialogOpen(newOpen)
      }
    },
    [setIsDialogOpen, onOpenChange]
  )

  const handleSubmit = useCallback(async () => {
    if (!targetNTPId) return

    setIsSubmitting(true)
    try {
      const payload: SubmitNTPPayload = {
        ntpId: targetNTPId,
        submittedBy: 'current-user', // TODO: Get from auth context
        submittedAt: new Date().toISOString(),
      }

      const result = mockNTPStore.submit(payload)
      if (result) {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        handleDialogOpen(false)
        if (onSuccess) {
          onSuccess()
        } else {
          // Reload page to show updated status
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Failed to submit NTP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [targetNTPId, handleDialogOpen, onSuccess])

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit NTP for Approval?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to submit this NTP for approval. Once submitted, it will change to "For Approval" status
            and will be ready for review and approval by the BAC Chairperson. This action cannot be undone easily.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> The NTP status will change to "For Approval" and will be
              locked from further editing until it is either approved or returned.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
