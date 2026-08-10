import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  closeCreateDialogAtom,
  createDialogAtom,
  createFormDataAtom,
  hasUnsavedCreateFormAtom,
} from '../atoms'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'
import CreateFiscalYearForm from '../form/CreateFiscalYearForm'

interface CreateFiscalYearDialogProps {
  onCreated?: (data: AppFiscalYear) => void
}

export default function CreateFiscalYearDialog({ onCreated }: CreateFiscalYearDialogProps) {
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const formData = useAtomValue(createFormDataAtom)
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)

  const { isOpen, showUnsavedWarning } = dialogState

  const sanitizedInitialValues: Partial<AppFiscalYear> = useMemo(() => {
    return {
      year: formData.year || new Date().getFullYear(),
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      description: formData.description || '',
    }
  }, [formData])

  const handleCreateFiscalYear = (data: Partial<AppFiscalYear>) => {
    // Validate dates
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)

      if (startDate >= endDate) {
        toast.error('End date must be after start date')
        return
      }
    }

    // Create mock fiscal year
    const mockFY: AppFiscalYear = {
      id: `fy-${data.year}-${Date.now()}`,
      year: data.year || new Date().getFullYear(),
      description: data.description || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: 'Draft',
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    toast.success('Fiscal year created successfully!')
    onCreated?.(mockFY)
    closeDialog(true)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setDialogState({ showUnsavedWarning: true })
    } else {
      closeDialog(true)
    }
  }

  const handleConfirmClose = () => {
    setDialogState({ showUnsavedWarning: false })
    closeDialog(true)
  }

  const handleCancelClose = () => {
    setDialogState({ showUnsavedWarning: false })
  }

  return (
    <>
      {!showUnsavedWarning && (
        <ResponsiveDialog
          open={isOpen}
          onOpenChange={(open) =>
            open ? setDialogState({ isOpen: true }) : handleClose()
          }
          title="Create Fiscal Year"
          description="Add a new fiscal year for performance planning"
        >
          <CreateFiscalYearForm
            onSubmit={handleCreateFiscalYear}
            onCancel={handleClose}
            initialValues={sanitizedInitialValues}
          />
        </ResponsiveDialog>
      )}

      {showUnsavedWarning && (
        <ConfirmAlertDialog
          open={showUnsavedWarning}
          onOpenChange={handleCancelClose}
          title="Unsaved Changes"
          description="You have unsaved changes that will be lost. Are you sure you want to continue?"
          onConfirm={handleConfirmClose}
          confirmLabel="Discard Changes"
          cancelLabel="Keep Editing"
        />
      )}
    </>
  )
}
