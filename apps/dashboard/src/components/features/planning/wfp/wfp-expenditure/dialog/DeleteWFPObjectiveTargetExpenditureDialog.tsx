import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { deleteDialogAtom } from '../atoms'
import { deleteWFPObjectiveTargetExpenditureRequest } from '../handlers/deleteWFPObjectiveTargetExpenditureRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteWFPObjectiveTargetExpenditure = createMutationHookFromTemplate(deleteWFPObjectiveTargetExpenditureRequest)

export default function DeleteWFPObjectiveTargetExpenditureDialog() {
  const [dialogState, setDialogState] = useAtom(deleteDialogAtom)
  const { mutateAsync, isPending } = useDeleteWFPObjectiveTargetExpenditure()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    const id = dialogState.selectedId
    if (!id) return

    try {
      await mutateAsync({
        pathParams: { id },
      })

      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && key.includes('/wfp-objective-activities')
        ),
      })

      toast.success('WFP Objective Target Expenditure deleted successfully!')
      setDialogState({ isOpen: false, selectedId: null })
    } catch (error) {
      toast.error('Failed to delete WFP Objective Target Expenditure.')
    }
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={handleDelete}
      open={dialogState.isOpen}
      onOpenChange={(open) => setDialogState({ ...dialogState, isOpen: open })}
      title="Are you absolutely sure you want to delete this Expenditure?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}
