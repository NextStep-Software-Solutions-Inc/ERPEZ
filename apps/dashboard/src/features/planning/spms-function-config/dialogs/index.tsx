import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createFunctionConfigDialogOpenAtom,
  editFunctionConfigDialogOpenAtom,
  deleteFunctionConfigDialogOpenAtom,
  selectedFunctionConfigForEditAtom,
  selectedFunctionConfigForDeleteAtom,
} from '../atoms'
import {
  useCreateFunctionConfig,
  useUpdateFunctionConfig,
  useDeleteFunctionConfig,
} from '../handlers/hooks'
import FunctionConfigForm from '../forms/FunctionConfigForm'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CreateFunctionConfigPayload,
  UpdateFunctionConfigPayload,
} from '../types/functionConfigTypes'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

interface DialogProps {
  onSuccess?: () => void
}

/**
 * Create Function Weights Dialog
 */
export function CreateFunctionConfigDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(createFunctionConfigDialogOpenAtom)
  const { mutateAsync: createConfig, isPending } = useCreateFunctionConfig()

  const handleClose = () => setOpen(false)

  const handleSubmit = async (values: CreateFunctionConfigPayload) => {
    try {
      const response = await createConfig({ pathParams: {}, payload: values })
      toast.success(response.message || 'Function weights created successfully')
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create configuration'
      toast.error(errorMessage)
    }
  }

  const formId = 'create-function-config-form'

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Create Function Weights"
      description="Define min/max weight percentages for a new fiscal year."
      size="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Create Configuration'}
          </Button>
        </div>
      }
    >
      <FunctionConfigForm
        formId={formId}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </ResponsiveDialogDashtail>
  )
}

/**
 * Edit Function Weights Dialog
 */
export function EditFunctionConfigDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(editFunctionConfigDialogOpenAtom)
  const [selectedConfig, setSelectedConfig] = useAtom(
    selectedFunctionConfigForEditAtom,
  )
  const { mutateAsync: updateConfig, isPending } = useUpdateFunctionConfig()

  const handleClose = () => {
    setOpen(false)
    setSelectedConfig(null)
  }

  const handleSubmit = async (values: UpdateFunctionConfigPayload) => {
    if (!selectedConfig) return
    try {
      const response = await updateConfig({
        pathParams: { id: selectedConfig.id },
        payload: values,
      })
      toast.success(response.message || 'Configuration updated successfully')
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update configuration'
      toast.error(errorMessage)
    }
  }

  const formId = `edit-function-config-form-${selectedConfig?.id}`

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setOpen(true)
        } else {
          handleClose()
        }
      }}
      title="Edit Function Weights"
      description={`Currently configuring for FY ${selectedConfig?.fiscalYearYear}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Configuration'}
          </Button>
        </div>
      }
    >
      <div className="py-2">
        {selectedConfig && (
          <FunctionConfigForm
            formId={formId}
            isEdit
            initialValues={selectedConfig}
            onSubmit={handleSubmit}
            isLoading={isPending}
          />
        )}
      </div>
    </ResponsiveDialogDashtail>
  )
}

/**
 * Delete Function Weights Confirmation
 */
export function DeleteFunctionConfigDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(deleteFunctionConfigDialogOpenAtom)
  const [selectedConfig, setSelectedConfig] = useAtom(
    selectedFunctionConfigForDeleteAtom,
  )
  const { mutateAsync: deleteConfig, isPending } = useDeleteFunctionConfig()

  const handleClose = () => {
    setOpen(false)
    setSelectedConfig(null)
  }

  const handleDelete = async () => {
    if (!selectedConfig) return
    try {
      const response = await deleteConfig({
        pathParams: { id: selectedConfig.id },
      })
      toast.success(response.message || 'Configuration deleted successfully')
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete configuration'
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSelectedConfig(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Configuration?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the function weights for{' '}
            <strong>FY {selectedConfig?.fiscalYearYear}</strong>? This will also
            affect all related SPMS evaluations for this year.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
