import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  closeUpdateDialogAtom,
  updateDialogAtom,
  updateFormDataAtom,
  hasUnsavedUpdateFormAtom,
} from '../atoms'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'
import UpdateFiscalYearForm from '../form/UpdateFiscalYearForm'

interface UpdateFiscalYearDialogProps {
  allFiscalYears?: AppFiscalYear[]
  onUpdated?: (data: AppFiscalYear) => void
}

export default function UpdateFiscalYearDialog({
  allFiscalYears = [],
  onUpdated,
}: UpdateFiscalYearDialogProps) {
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)
  const [, setFormData] = useAtom(updateFormDataAtom) as any
  const setHasUnsavedChanges = useSetAtom(hasUnsavedUpdateFormAtom)
  const hasUnsavedChangesValue = useAtomValue(hasUnsavedUpdateFormAtom)
  const closeDialog = useSetAtom(closeUpdateDialogAtom)

  const selectedId = dialogState.selectedId || ''
  const selectedFY = allFiscalYears.find((fy) => fy.id === selectedId)
  const isLoading = !selectedFY && selectedId

  const handleUpdateFiscalYear = (data: Partial<AppFiscalYear>) => {
    if (!selectedId || !selectedFY) return

    // Validate dates
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)

      if (startDate >= endDate) {
        toast.error('End date must be after start date')
        return
      }
    }

    const updatedFY: AppFiscalYear = {
      ...selectedFY,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    toast.success('Fiscal year updated successfully!')
    onUpdated?.(updatedFY)
    closeDialog(true)
    setHasUnsavedChanges(false)
  }

  const handleValueChange = (fieldName: keyof AppFiscalYear, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }))
    setHasUnsavedChanges(true)
  }

  const handleClose = () => {
    if (hasUnsavedChangesValue) {
      setDialogState({ ...dialogState, showUnsavedWarning: true })
    } else {
      closeDialog(true)
    }
  }

  const handleConfirmClose = () => {
    setDialogState({ ...dialogState, showUnsavedWarning: false })
    closeDialog(true)
  }

  const handleCancelClose = () => {
    setDialogState({ ...dialogState, showUnsavedWarning: false })
  }

  return (
    <>
      <>
        <ResponsiveDialog
          open={dialogState.isOpen}
          onOpenChange={(open) =>
            open
              ? setDialogState({ ...dialogState, isOpen: true })
              : handleClose()
          }
          title="Edit Fiscal Year"
          description="Modify the fiscal year details"
        >
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : selectedFY ? (
            <UpdateFiscalYearForm
              onSubmit={handleUpdateFiscalYear}
              onCancel={handleClose}
              onValueChange={handleValueChange}
              fiscalYear={selectedFY}
            />
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-gray-500">Fiscal year not found</p>
            </div>
          )}
        </ResponsiveDialog>
      </>

      <>
        <ConfirmAlertDialog
          open={dialogState.showUnsavedWarning}
          onOpenChange={handleCancelClose}
          title="Unsaved Changes"
          description="You have unsaved changes that will be lost. Are you sure you want to continue?"
          onConfirm={handleConfirmClose}
          confirmLabel="Discard Changes"
          cancelLabel="Keep Editing"
        />
      </>
    </>
  )
}
