import React from 'react'
import { useAtom } from 'jotai'
import { Check } from 'lucide-react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { approveDialogAtom } from '../atoms'
import { updateWFPStatusRequest } from '../handlers/updateWFPStatusRequest'
import { DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

const useUpdateWfpStatus = createMutationHookFromTemplate(updateWFPStatusRequest)

export default function ApproveWfpDialog() {
  const [dialogState, setDialogState] = useAtom(approveDialogAtom)
  const { mutateAsync, isPending } = useUpdateWfpStatus()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dialogState.selectedId) return

    try {
      await mutateAsync({
        pathParams: { wfpId: dialogState.selectedId },
        payload: { status: 'Approved' },
      })

      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && key.includes('/wfps')
        ),
      })

      toast.success('WFP approved successfully!')
      setDialogState({ isOpen: false, selectedId: null })
    } catch (error) {
      toast.error('Failed to approve WFP.')
    }
  }

  const handleCancel = () => {
    setDialogState({ isOpen: false, selectedId: null })
  }

  return (
    <ResponsiveDialog
      open={dialogState.isOpen}
      onOpenChange={(open) => setDialogState({ ...dialogState, isOpen: open })}
      title="Approving WFP"
      description="Are you sure you want to approve this Work Financial Plan?"
    >
      <form onSubmit={handleSubmit}>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            <Check className="h-4 w-4 mr-2" />
            {isPending ? 'Approving...' : 'Approve WFP'}
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveDialog>
  )
}
