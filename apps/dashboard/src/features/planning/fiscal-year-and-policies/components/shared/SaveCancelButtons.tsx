import { useCallback, useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useToast } from '@/components/ui/use-toast'
import { ProcurementMethodThreshold } from '@/lib/fiscal-year-and-policies/procurement-threshold.types'

interface SaveCancelButtonsProps {
  onSave: () => void
  onCancel: () => void
  hasUnsavedChanges?: boolean
  draftThresholds: ProcurementMethodThreshold[]
  setProcurementThresholds: (thresholds: ProcurementMethodThreshold[]) => void
  setDraftThresholds: (thresholds: ProcurementMethodThreshold[]) => void
  toolbarState: { isEditMode: boolean }
  setToolbarState: (
    state: (prev: { isEditMode: boolean }) => { isEditMode: boolean },
  ) => void
  activeFiscalYear?: { year: string }
}

export function SaveCancelButtons({
  hasUnsavedChanges = false,
  draftThresholds,
  setProcurementThresholds,
  setDraftThresholds,
  toolbarState,
  setToolbarState,
  activeFiscalYear,
}: SaveCancelButtonsProps) {
  const { toast } = useToast()

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const validateThresholds = useCallback(
    (
      thresholds: ProcurementMethodThreshold[],
    ): { isValid: boolean; errors: string[] } => {
      const errors: string[] = []

      thresholds.forEach((threshold) => {
        if (!threshold.isConfigured) return

        if (threshold.min === null || threshold.max === null) {
          errors.push(
            `${threshold.procurementMethodId}: Min and Max are required`,
          )
          return
        }

        if (threshold.min > threshold.max) {
          errors.push(`${threshold.procurementMethodId}: Min cannot exceed Max`)
        }
      })

      return { isValid: errors.length === 0, errors }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    setIsValidating(true)

    try {
      const validation = validateThresholds(draftThresholds)

      if (!validation.isValid) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join(', '),
          color: 'destructive',
        })
        setIsValidating(false)
        return
      }

      // Persist changes
      setProcurementThresholds(draftThresholds)
      setDraftThresholds([]) // Clear draft
      setToolbarState((prev) => ({ ...prev, isEditMode: false }))

      toast({
        title: 'Success',
        description: `Procurement thresholds saved for FY ${activeFiscalYear?.year}.`,
        // variant: 'default',
      })
    } finally {
      setIsValidating(false)
    }
  }, [
    draftThresholds,
    validateThresholds,
    setProcurementThresholds,
    setDraftThresholds,
    setToolbarState,
    activeFiscalYear,
    toast,
  ])

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setIsConfirmDialogOpen(true)
    } else {
      setToolbarState((prev) => ({ ...prev, isEditMode: false }))
    }
  }, [hasUnsavedChanges, setToolbarState])

  const handleConfirmCancel = useCallback(() => {
    setDraftThresholds([]) // Clear draft
    setToolbarState((prev) => ({ ...prev, isEditMode: false }))
    setIsConfirmDialogOpen(false)

    toast({
      title: 'Cancelled',
      description: 'Changes discarded.',
      //   variant: 'default',
    })
  }, [setDraftThresholds, setToolbarState, toast])

  if (!toolbarState.isEditMode) {
    return null
  }

  return (
    <>
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isValidating}
          color="default"
          size="md"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isValidating || !hasUnsavedChanges}
          color="primary"
          size="md"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isValidating ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Discard Changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              You have unsaved changes. Are you sure you want to discard all
              changes? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => setIsConfirmDialogOpen(false)}
              className="gap-2"
            >
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              color="destructive"
              className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
