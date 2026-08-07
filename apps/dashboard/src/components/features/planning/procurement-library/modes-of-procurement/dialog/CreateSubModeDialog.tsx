import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useToast } from '@/components/ui/use-toast'
import type { ModeOfProcurement } from '../../types'
import { addMockSubMode, type SubProcurementMode } from '../mockSubModes'
import { SubModeForm, type SubModeFormValues } from './SubModeForm'

interface CreateSubModeDialogProps {
  parentMode: ModeOfProcurement
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSuccess?: (subMode: SubProcurementMode) => void
}

export function CreateSubModeDialog({
  parentMode,
  open,
  onOpenChange,
  onCreateSuccess,
}: CreateSubModeDialogProps) {
  const { toast } = useToast()
  const parentMin = parentMode.minThreshold ?? 0
  const parentMax = parentMode.maxThreshold ?? null

  const formatCurrency = (v: number | null) =>
    v === null ? 'unlimited' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const handleSubmit = (values: SubModeFormValues) => {
    const minVal = values.minThreshold.trim() ? parseFloat(values.minThreshold) : 0
    const maxVal = values.maxThreshold.trim() ? parseFloat(values.maxThreshold) : null

    const created = addMockSubMode({
      parentModeId: parentMode.id,
      parentModeName: parentMode.modeName,
      modeName: values.name.trim(),
      description: values.description.trim() || null,
      categoryId: parentMode.categoryId,
      categoryName: parentMode.categoryName,
      minThreshold: minVal,
      maxThreshold: maxVal,
      isActive: true,
      isArchived: false,
    })

    toast({
      title: 'Sub-mode created',
      description: `"${created.modeName}" has been added under "${parentMode.modeName}".`,
      color: 'success',
    })

    onCreateSuccess?.(created)
    onOpenChange(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Sub-Procurement Mode"
      description={`Creating a sub-mode under "${parentMode.modeName ?? ''}". Thresholds must fall within: ${formatCurrency(parentMin)} – ${formatCurrency(parentMax)}.`}
      footer={null}
      showCloseButton
    >
      <SubModeForm
        parentMode={parentMode}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        submitLabel="Add Sub-Mode"
      />
    </ResponsiveDialog>
  )
}
