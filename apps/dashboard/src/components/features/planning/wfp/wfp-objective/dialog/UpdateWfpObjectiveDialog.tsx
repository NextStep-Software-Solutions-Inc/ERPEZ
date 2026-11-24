import { useAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateDialogAtom } from '../atoms'
import { updateWFPObjectiveRequest } from '../handlers/updateWFPObjectiveRequest'
import { getWFPObjectiveRequest } from '../handlers/getWFPObjectiveRequest'
import UpdateWFPObjectiveForm from '../form/UpdateWFPObjectiveForm'
import type { UpdateWFPObjectiveValues } from '../form/UpdateWFPObjectiveForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateWFPObjectiveDialogProps {
  objectiveId?: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

const useUpdateWFPObjective = createMutationHookFromTemplate(updateWFPObjectiveRequest)
const useWFPObjective = createQueryHookFromTemplate(getWFPObjectiveRequest)

export default function UpdateWFPObjectiveDialog({
  objectiveId: propObjectiveId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onClose,
}: UpdateWFPObjectiveDialogProps = {}) {
  const { mutateAsync } = useUpdateWFPObjective()
  const [atomState, setAtomState] = useAtom(updateDialogAtom)
  const queryClient = useQueryClient()

  const selectedId = propObjectiveId !== undefined ? (propObjectiveId || '') : (atomState.selectedId || '')
  const isOpen = controlledOpen !== undefined ? controlledOpen : atomState.isOpen

  const handleOpenChange = (open: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open)
    } else {
      setAtomState({ isOpen: open, selectedId: open ? selectedId : null, showUnsavedWarning: false })
    }
    if (!open && onClose) {
      onClose()
    }
  }

  const { data: wfpObjectiveResponse, isLoading } = useWFPObjective({
    pathParams: { id: selectedId },
    queryParams: {},
  })

  const wfpObjectiveData = wfpObjectiveResponse?.data

  const handleUpdate = async (data: UpdateWFPObjectiveValues) => {
    const toastId = toast.loading('Updating WFP Objective...')
    try {
      await mutateAsync({
        pathParams: { id: selectedId },
        payload: data,
      })
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && (
            key.includes('/wfp-objectives') ||
            key.includes('/wfps')
          )
        ),
      })
      toast.success('WFP Objective updated successfully!', { id: toastId })
      handleOpenChange(false)
    } catch {
      toast.dismiss(toastId)
    }
  }

  const handleClose = () => {
    handleOpenChange(false)
  }

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Update WFP Objective"
      description="Modify the details of the WFP Objective."
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <UpdateWFPObjectiveForm
          onSubmit={handleUpdate}
          onCancel={handleClose}
          initialValues={{
            description: wfpObjectiveData?.description || '',
            weight: wfpObjectiveData?.weight || 0,
            outcome: wfpObjectiveData?.outcome || '',
            wfpId: wfpObjectiveData?.wfpId || '',
          }}
          wfpId={wfpObjectiveData?.wfpId || ''}
        />
      )}
    </ResponsiveDialog>
  )
}