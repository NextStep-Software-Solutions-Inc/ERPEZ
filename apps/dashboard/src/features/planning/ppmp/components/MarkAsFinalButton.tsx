/**
 * MarkAsFinalButton
 * Button component for marking PPMP as final.
 * Validates PPMP completeness before toggle.
 * Always clickable (soft toggle).
 */

import { useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PPMP, PPMPActivityBlock } from '../types'
import { validatePpmpForFinalization } from '../lib/ppmpValidation'
import { cn } from '@/lib/utils'

interface MarkAsFinalButtonProps {
  ppmp: PPMP | null
  isLoading?: boolean
  onToggleFinal: (newFinalState: boolean) => void | Promise<void>
}

export function MarkAsFinalButton({
  ppmp,
  isLoading = false,
  onToggleFinal,
}: MarkAsFinalButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showErrors, setShowErrors] = useState(false)

  if (!ppmp) return null

  const isFinal = ppmp.isFinal ?? false
  const activityBlocks = ppmp.activityBlocks || []

  const handleClick = () => {
    // If already marked final, allow immediate toggle without validation
    if (isFinal) {
      setShowConfirm(true)
      setValidationErrors([])
      return
    }

    // If marking final, validate first
    const validation = validatePpmpForFinalization(
      activityBlocks as PPMPActivityBlock[],
    )

    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      setShowErrors(true)
      return
    }

    // Validation passed, show confirmation
    setShowConfirm(true)
    setValidationErrors([])
  }

  const handleConfirm = async () => {
    setShowConfirm(false)
    await onToggleFinal(!isFinal)
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'gap-2 transition-all',
          isFinal
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-slate-900 hover:bg-slate-800 text-white',
        )}
      >
        {isFinal ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Marked as Final
          </>
        ) : (
          <>
            <Clock className="h-4 w-4" />
            Mark as Final
          </>
        )}
      </Button>

      {/* Validation Errors Dialog */}
      <AlertDialog open={showErrors} onOpenChange={setShowErrors}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>PPMP Not Ready to Finalize</AlertDialogTitle>
            <AlertDialogDescription>
              Please fix the following issues before marking as final:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {validationErrors.map((error, idx) => (
              <Alert
                key={idx}
                className="bg-destructive/10 border-destructive/30 text-destructive"
              >
                <AlertDescription className="text-xs leading-relaxed">
                  {error}
                </AlertDescription>
              </Alert>
            ))}
          </div>

          <div className="flex justify-end">
            <AlertDialogCancel>Close</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isFinal ? 'Unmark as Final?' : 'Mark PPMP as Final?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isFinal
                ? 'You can still edit and unmark this PPMP at any time. This is a soft indicator only.'
                : 'This marks the PPMP as finalized. You can still edit and unmark it later. This is a soft indicator for tracking purposes.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="bg-muted/50 rounded p-3 space-y-1 text-sm">
            <p className="text-muted-foreground">
              <strong>PPMP ID:</strong> {ppmp.id}
            </p>
            <p className="text-muted-foreground">
              <strong>Current Status:</strong>{' '}
              {isFinal ? '✓ Marked as Final' : 'Not Finalized'}
            </p>
            {isFinal && ppmp.finalizedAt && (
              <p className="text-muted-foreground text-xs">
                <strong>Finalized:</strong>{' '}
                {new Date(ppmp.finalizedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={isFinal ? 'bg-slate-600 hover:bg-slate-700' : ''}
            >
              {isFinal ? 'Unmark as Final' : 'Confirm - Mark Final'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
