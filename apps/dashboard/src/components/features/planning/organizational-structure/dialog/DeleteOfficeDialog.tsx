import React, { useState, useEffect } from 'react'
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
import { Loader2, AlertTriangle } from 'lucide-react'
import { useValidateOrgUnitDeletion, useDeleteOrgUnit, useOrgUnit } from '@/pages/planning/organization/hooks/useOrgUnits'
import { toast } from 'sonner'

interface DeleteOfficeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId?: string
  unitName?: string
  onSuccess?: () => void
}

function DeleteOfficeDialog({
  open,
  onOpenChange,
  unitId,
  unitName,
  onSuccess,
}: DeleteOfficeDialogProps) {
  const { data: fetchedUnit } = useOrgUnit(unitName ? null : (unitId ?? null))
  const displayName = unitName || fetchedUnit?.name || 'Office'

  const [canDelete, setCanDelete] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateMutation = useValidateOrgUnitDeletion()
  const deleteMutation = useDeleteOrgUnit()

  // Validate on dialog open
  useEffect(() => {
    if (open && unitId) {
      setIsValidating(true)
      setValidationError(null)
      setCanDelete(true)

      const validateAsync = async () => {
        try {
          const result = await validateMutation.mutateAsync(unitId)
          setCanDelete(result.canDelete)
          setValidationError(result.reason || null)
        } catch (error) {
          setCanDelete(false)
          setValidationError('Failed to validate unit deletion')
        } finally {
          setIsValidating(false)
        }
      }

      validateAsync()
    }
  }, [open, unitId])

  const handleConfirmDelete = async () => {
    if (!unitId || !canDelete) return

    toast.promise(
      deleteMutation.mutateAsync(unitId),
      {
        loading: 'Deleting office...',
        success: () => {
          onOpenChange(false)
          onSuccess?.()
          return `Office "${displayName}" has been deleted successfully`
        },
        error: (error) => {
          return error instanceof Error ? error.message : 'Failed to delete office'
        },
      },
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <AlertDialogTitle>Delete Office</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm mt-2">
            {isValidating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </div>
            ) : validationError ? (
              <div className="text-destructive font-semibold">{validationError}</div>
            ) : (
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">"{displayName}"</span>?
                <br />
                <br />
                This action cannot be undone. The office will be soft-deleted and no
                longer visible in the system.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isValidating && (
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={!canDelete || deleteMutation.isPending}
              className={`${
                !canDelete
                  ? 'opacity-50 cursor-not-allowed'
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              }`}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Office'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteOfficeDialog
