import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import {
  closeCreateDialogAtom,
  createDialogAtom,
  createFormDataAtom,
  hasUnsavedCreateFormAtom,
} from '../atoms'
import CreateWFPObjectiveForm, { createWFPObjectiveSchema } from '../form/CreateWFPObjectiveForm'
import { createBatchWFPObjectiveRequest } from '../handlers/createBatchWFPObjectiveRequest'
import type { CreateWFPObjectiveValues } from '../form/CreateWFPObjectiveForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { OPCR } from '@/components/features/planning/wfp/opcr/table/types'

interface CreateWFPObjectiveDialogProps {
  onCreated?: (data: CreateWFPObjectiveValues) => void
  wfpId: string
  wfpObjectiveId?: string
  remainingWeight?: number
  opcr?: OPCR
}

const useCreateBatchWFPObjective = createMutationHookFromTemplate(createBatchWFPObjectiveRequest)

export default function CreateWFPObjectiveDialog({ onCreated, wfpId, remainingWeight, opcr }: CreateWFPObjectiveDialogProps) {
  const { mutateAsync } = useCreateBatchWFPObjective()
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const formData = useAtomValue(createFormDataAtom)
  const queryClient = useQueryClient()
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)
  const { isOpen, showUnsavedWarning } = dialogState
  const dialogTitle = 'Create Objectives & Activities'
  const dialogDescription = 'Fill in objective details and select or manually add activities under each objective.'
  const sanitizedInitialValues = useMemo(() => {
    const schemaKeys = Object.keys(createWFPObjectiveSchema.shape)
    return Object.fromEntries(
      Object.entries(formData).filter(([key]) => schemaKeys.includes(key))
    ) as Partial<CreateWFPObjectiveValues>
  }, [formData])

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
                typeof key === 'string' && key.includes('/wfps')
              ),
            })
            onCreated?.(data)
            closeDialog(true)
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
    if (hasUnsavedChanges) {
      setDialogState({ showUnsavedWarning: true })
    } else {
      closeDialog(true)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      setDialogState({ showUnsavedWarning: true })
      return
    }
    if (!open) {
      closeDialog(true)
    }
  }

  return (
    <>
      <ResponsiveDialog
        size="lg"
        open={isOpen}
        onOpenChange={handleDialogOpenChange}
        title={dialogTitle}
        description={dialogDescription}
        className="sm:max-w-[850px]"
      >
        <CreateWFPObjectiveForm
          onSubmit={handleCreateWFPObjective}
          onCancel={handleClose}
          initialValues={sanitizedInitialValues}
          wfpId={wfpId}
          remainingWeight={remainingWeight}
          opcr={opcr}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={(open) =>
          !open && setDialogState({ showUnsavedWarning: false })
        }
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          closeDialog(true)
        }}
        onCancel={() => setDialogState({ showUnsavedWarning: false })}
      />
    </>
  )
}
