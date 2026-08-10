import { useAtom, useSetAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  closeCreateDialogAtom,
  createDialogAtom,
  addExpenditureAtom,
  type Expenditure,
} from '../atoms'
import CreateOPCRActivityExpenditureForm from '../form/CreateOPCRActivityExpenditureForm'
import type { CreateOPCRActivityExpenditureValues } from '../form/CreateOPCRActivityExpenditureForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

interface CreateOPCRActivityExpenditureDialogProps {
  activityId?: string
  onCreated?: () => void
}

export default function CreateOPCRActivityExpenditureDialog({
  onCreated
}: CreateOPCRActivityExpenditureDialogProps) {
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const addExpenditure = useSetAtom(addExpenditureAtom)
  const { isOpen, showUnsavedWarning, activityId } = dialogState
  const hasUnsavedChanges = dialogState.hasUnsavedChanges || false
  const queryClient = useQueryClient()

  const handleFormChange = (hasChanges: boolean) => {
    setDialogState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }))
  }

  const handleCreate = (data: CreateOPCRActivityExpenditureValues) => {
    if (!activityId) {
      toast.error('Activity ID is missing')
      return
    }

    // Create expenditure object
    const newExpenditure: Expenditure = {
      id: `exp-${Date.now()}`,
      activityId,
      date: data.date,
      description: data.description,
      amount: data.amount,
      items: [
        {
          id: `item-${Date.now()}`,
          description: data.description,
          quantity: 1,
          unitCost: data.amount,
        },
      ],
      createdAt: new Date().toISOString(),
    }

    // Add to expenditures atom
    addExpenditure(newExpenditure)

    // Show success message
    toast.success('Expenditure created successfully!')

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey.some(key =>
        typeof key === 'string' && key.includes('opcr')
      ),
    })

    onCreated?.()
    closeDialog()
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      setDialogState(prev => ({ ...prev, showUnsavedWarning: true }))
    } else if (!open) {
      closeDialog()
    }
  }

  return (
    <>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={handleDialogOpenChange}
        title="Create Expenditure"
        description="Add a new expenditure for this OPCR activity."
      >
        <CreateOPCRActivityExpenditureForm
          onSubmit={handleCreate}
          onFormChange={handleFormChange}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={(open) => !open && setDialogState(prev => ({ ...prev, showUnsavedWarning: false }))}
        onConfirm={() => closeDialog()}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close this dialog?"
        confirmLabel="Close"
        cancelLabel="Cancel"
      />
    </>
  )
}