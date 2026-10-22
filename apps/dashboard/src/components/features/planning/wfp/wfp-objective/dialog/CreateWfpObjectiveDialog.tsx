import { useAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createDialogAtom } from '../atoms'
import CreateWFPObjectiveForm from '../form/CreateWFPObjectiveForm'
import { createBatchWFPObjectiveRequest } from '../handlers/createBatchWFPObjectiveRequest'
import type { CreateWFPObjectiveValues } from '../form/CreateWFPObjectiveForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import type { OPCR } from '@/components/features/planning/wfp/opcr/table/types'

interface CreateWFPObjectiveDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreated?: (data: CreateWFPObjectiveValues) => void
  wfpId: string
  wfpObjectiveId?: string
  remainingWeight?: number
  opcr?: OPCR
}

const useCreateBatchWFPObjective = createMutationHookFromTemplate(createBatchWFPObjectiveRequest)

export default function CreateWFPObjectiveDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCreated,
  wfpId,
  remainingWeight,
  opcr,
}: CreateWFPObjectiveDialogProps) {
  const { mutateAsync } = useCreateBatchWFPObjective()
  const [atomState, setAtomState] = useAtom(createDialogAtom)
  const queryClient = useQueryClient()

  const isOpen = controlledOpen !== undefined ? controlledOpen : atomState.isOpen
  const handleOpenChange = (open: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open)
    } else {
      setAtomState({ isOpen: open, showUnsavedWarning: false })
    }
  }

  const dialogTitle = 'Create Objectives & Activities'
  const dialogDescription = 'Fill in objective details and select or manually add activities under each objective.'

  const handleCreateWFPObjective = (data: CreateWFPObjectiveValues) => {
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.some(key => 
                typeof key === 'string' && (
                  key.includes('/wfps') ||
                  key.includes('/wfp-objectives') ||
                  key.includes('/wfp-objective-activities')
                )
              ),
            })
            onCreated?.(data)
            handleOpenChange(false)
          },
        },
      ),
      {
        loading: 'Creating WFP Objectives & Activities...',
        success: 'WFP Objectives & Activities created successfully!',
        error: (err: any) => err?.response?.data?.message || 'Failed to create WFP Objectives.',
      },
    )
  }

  const handleClose = () => {
    handleOpenChange(false)
  }

  return (
    <ResponsiveDialog
      size="lg"
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={dialogTitle}
      description={dialogDescription}
      className="sm:max-w-[850px]"
    >
      <CreateWFPObjectiveForm
        onSubmit={handleCreateWFPObjective}
        onCancel={handleClose}
        wfpId={wfpId}
        remainingWeight={remainingWeight}
        opcr={opcr}
      />
    </ResponsiveDialog>
  )
}
