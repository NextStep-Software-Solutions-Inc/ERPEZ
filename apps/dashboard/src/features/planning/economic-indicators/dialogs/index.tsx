import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createEconomicIndicatorDialogOpenAtom,
  editEconomicIndicatorDialogOpenAtom,
  deleteEconomicIndicatorDialogOpenAtom,
  selectedEconomicIndicatorForEditAtom,
  selectedEconomicIndicatorForDeleteAtom,
} from '../atoms'
import {
  useCreateEconomicIndicator,
  useUpdateEconomicIndicator,
  useDeleteEconomicIndicator,
} from '../handlers/hooks'
import EconomicIndicatorForm from '../forms/EconomicIndicatorForm'
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
  CreateEconomicIndicatorPayload,
  UpdateEconomicIndicatorPayload,
} from '../components/table/data/economicIndicatorTypes'

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
 * Create Economic Indicator Dialog
 */
export function CreateEconomicIndicatorDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(createEconomicIndicatorDialogOpenAtom)
  const { mutateAsync: createIndicator, isPending } =
    useCreateEconomicIndicator()

  const handleClose = () => setOpen(false)

  const handleSubmit = async (values: CreateEconomicIndicatorPayload) => {
    try {
      const payload: CreateEconomicIndicatorPayload = {
        ...values,
      }

      const response = await createIndicator({
        pathParams: {},
        payload,
      })

      toast.success(
        response.message || 'Economic indicator created successfully',
      )
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create indicator'
      toast.error(errorMessage)
    }
  }

  const formId = 'create-economic-indicator-form'

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Create Economic Indicator"
      description="Define economic indicators (VAT, inflation, income tax rates) for a fiscal year."
      size="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Indicator'}
          </Button>
        </div>
      }
    >
      <EconomicIndicatorForm
        formId={formId}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </ResponsiveDialogDashtail>
  )
}

/**
 * Edit Economic Indicator Dialog
 */
export function EditEconomicIndicatorDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(editEconomicIndicatorDialogOpenAtom)
  const [selected, setSelected] = useAtom(selectedEconomicIndicatorForEditAtom)
  const { mutateAsync: updateIndicator, isPending } =
    useUpdateEconomicIndicator()

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
  }

  const handleSubmit = async (values: UpdateEconomicIndicatorPayload) => {
    if (!selected) return

    try {
      const payload: UpdateEconomicIndicatorPayload = {
        vatRate: values.vatRate,
        inflationRate: values.inflationRate,
        incomeTaxRate: values.incomeTaxRate,
      }

      const response = await updateIndicator({
        pathParams: { id: selected.id },
        payload,
      })

      toast.success(
        response.message || 'Economic indicator updated successfully',
      )
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update indicator'
      toast.error(errorMessage)
    }
  }

  const formId = 'edit-economic-indicator-form'

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Edit Economic Indicator"
      description="Update economic indicator values."
      size="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Indicator'}
          </Button>
        </div>
      }
    >
      {selected && (
        <EconomicIndicatorForm
          formId={formId}
          onSubmit={handleSubmit}
          isLoading={isPending}
          initialValues={{
            fiscalYearId: selected.fiscalYearId,
            vatRate: selected.vatRate,
            inflationRate: selected.inflationRate,
            incomeTaxRate: selected.incomeTaxRate,
          }}
          isEdit={true}
        />
      )}
    </ResponsiveDialogDashtail>
  )
}

/**
 * Delete Economic Indicator Dialog
 */
export function DeleteEconomicIndicatorDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(deleteEconomicIndicatorDialogOpenAtom)
  const [selected, setSelected] = useAtom(
    selectedEconomicIndicatorForDeleteAtom,
  )
  const { mutateAsync: deleteIndicator, isPending } =
    useDeleteEconomicIndicator()

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
  }

  const handleConfirm = async () => {
    if (!selected) return

    try {
      await deleteIndicator({
        pathParams: { id: selected.id },
      })
      toast.success('Economic indicator deleted successfully')
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete indicator'
      toast.error(errorMessage)
    }
  }

  if (!selected) return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Economic Indicator</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the economic indicator for fiscal
            year {selected.fiscalYearYear}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
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
