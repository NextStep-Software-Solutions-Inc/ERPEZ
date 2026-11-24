import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { deleteDialogAtom } from '../atoms'

import { deleteWFPObjectiveTargetRequest } from '../handlers/deleteWFPObjectiveTargetRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteWFPObjectiveTarget = createMutationHookFromTemplate(deleteWFPObjectiveTargetRequest)

export default function DeleteWFPObjectiveTargetDialog() {
  const [dialogState, setDialogState] = useAtom(deleteDialogAtom)
  const { mutateAsync, isPending } = useDeleteWFPObjectiveTarget()
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
          typeof key === 'string' && (
            key.includes('/wfp-objective-activities') || 
            key.includes('/wfp-objectives') ||
            key.includes('/wfps')
          )
        ),
      })

      toast.success('WFP Objective Target deleted successfully!')
      setDialogState({ isOpen: false, selectedId: null })
    } catch (error) {
      toast.error('Failed to delete WFP Objective Target.')
    }
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={handleDelete}
      open={dialogState.isOpen}
      onOpenChange={(open) => setDialogState({ ...dialogState, isOpen: open })}
      title="Are you absolutely sure you want to delete this WFP Objective Target?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}
