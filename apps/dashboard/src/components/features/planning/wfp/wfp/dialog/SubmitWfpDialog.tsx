import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { updateWFPStatusRequest } from '../handlers/updateWFPStatusRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { atom } from 'jotai'

// Dialog state atom
export const submitWfpDialogAtom = atom<{
  isOpen: boolean
  wfpId: string | null
}>({
  isOpen: false,
  wfpId: null,
})

const useUpdateWfpStatus = createMutationHookFromTemplate(updateWFPStatusRequest)

export default function SubmitWfpDialog() {
  const [dialogState, setDialogState] = useAtom(submitWfpDialogAtom)
  const { mutateAsync, isPending } = useUpdateWfpStatus()
  const queryClient = useQueryClient()

  const handleSubmit = async () => {
    if (!dialogState.wfpId) return

    try {
      await mutateAsync({
        pathParams: { wfpId: dialogState.wfpId },
        payload: { status: 'Submitted' },
      })

      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && key.includes('/wfps')
        ),
      })

      toast.success('WFP submitted successfully!')
      setDialogState({ isOpen: false, wfpId: null })
    } catch (error) {
      toast.error('Failed to submit WFP.')
    }
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={handleSubmit}
      open={dialogState.isOpen}
      onOpenChange={(open) => 
        setDialogState({ ...dialogState, isOpen: open, wfpId: open ? dialogState.wfpId : null })
      }
      title="Submit WFP?"
      description="Are you sure you want to submit this Work and Financial Plan (WFP)? This action cannot be undone."
      confirmLabel="Submit"
      cancelLabel="Cancel"
    />
  )
}
