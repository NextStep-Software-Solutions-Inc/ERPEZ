import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useToast } from '@/components/ui/use-toast'
import type { ModeOfProcurement } from '../../types'
import { updateMockSubMode, type SubProcurementMode } from '../mockSubModes'
import { SubModeForm, type SubModeFormValues } from './SubModeForm'

interface EditSubModeDialogProps {
  parentMode: ModeOfProcurement
  subMode: SubProcurementMode
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditSuccess?: (updated: SubProcurementMode) => void
}

export function EditSubModeDialog({
  parentMode,
  subMode,
  open,
  onOpenChange,
  onEditSuccess,
}: EditSubModeDialogProps) {
  const { toast } = useToast()
  const parentMin = parentMode.minThreshold ?? 0
  const parentMax = parentMode.maxThreshold ?? null

  const formatCurrency = (v: number | null) =>
    v === null ? 'unlimited' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const initialValues: SubModeFormValues = {
    name: subMode.modeName,
    description: subMode.description ?? '',
    minThreshold: subMode.minThreshold != null ? String(subMode.minThreshold) : '',
    maxThreshold: subMode.maxThreshold != null ? String(subMode.maxThreshold) : '',
  }

  const handleSubmit = (values: SubModeFormValues) => {
    const minVal = values.minThreshold.trim() ? parseFloat(values.minThreshold) : 0
    const maxVal = values.maxThreshold.trim() ? parseFloat(values.maxThreshold) : null

    const updated = updateMockSubMode(subMode.id, {
      modeName: values.name.trim(),
      description: values.description.trim() || null,
      minThreshold: minVal,
      maxThreshold: maxVal,
    })

    if (!updated) return

    toast({
      title: 'Sub-mode updated',
      description: `"${updated.modeName}" has been updated.`,
      color: 'success',
    })

    onEditSuccess?.(updated)
    onOpenChange(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Sub-Procurement Mode"
      description={`Editing sub-mode under "${parentMode.modeName ?? ''}". Thresholds must fall within: ${formatCurrency(parentMin)} – ${formatCurrency(parentMax)}.`}
      footer={null}
      showCloseButton
    >
      <SubModeForm
        parentMode={parentMode}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        submitLabel="Save Changes"
      />
    </ResponsiveDialog>
  )
}
