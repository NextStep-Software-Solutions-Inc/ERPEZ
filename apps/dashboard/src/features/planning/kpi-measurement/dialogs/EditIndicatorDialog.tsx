import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import IndicatorForm from '../forms/IndicatorForm'
import {
  editIndicatorDialogOpenAtom,
  selectedIndicatorForEditAtom,
  kpiWithIndicatorsAtom,
} from '../atoms'
import {
  updateIndicatorHandler,
  getKpiWithIndicatorsHandler,
} from '../handlers'
import type { IndicatorFormValues } from '../forms/indicator-form.schema'

const formId = 'edit-indicator-form'

export function EditIndicatorDialog() {
  const [open, setOpen] = useAtom(editIndicatorDialogOpenAtom)
  const [selectedIndicator, setSelectedIndicator] = useAtom(
    selectedIndicatorForEditAtom,
  )
  const [_, setKpisWithIndicators] = useAtom(kpiWithIndicatorsAtom)
  const [selectedTemplates, setSelectedTemplates] = useState<
    Array<{ id: string; name: string }>
  >([])

  // Get rating scale templates
  useEffect(() => {
    setSelectedTemplates([
      { id: 'efficiency-scale', name: 'Efficiency Scale' },
      { id: 'accuracy-scale', name: 'Accuracy Scale' },
      { id: 'timeliness-scale', name: 'Timeliness Scale' },
      { id: 'satisfaction-scale', name: 'Satisfaction Scale' },
    ])
  }, [])

  // Update indicator mutation
  const { mutateAsync: updateIndicator, isPending } = useMutation({
    mutationFn: async (indicatorData: IndicatorFormValues) => {
      if (!selectedIndicator?.id) {
        throw new Error('No indicator selected')
      }
      return updateIndicatorHandler(selectedIndicator.id, indicatorData)
    },
    onSuccess: async () => {
      toast.success('Indicator updated successfully')
      // Refresh KPI list
      const result = await getKpiWithIndicatorsHandler()
      setKpisWithIndicators(result.data)
      // Reset dialog
      setOpen(false)
      setSelectedIndicator(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update indicator',
      )
    },
  })

  const handleFormSubmit = (values: IndicatorFormValues) => {
    updateIndicator(values)
  }

  const handleDialogClose = () => {
    setOpen(false)
    setSelectedIndicator(null)
  }

  if (!selectedIndicator) return null

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={handleDialogClose}
      title="Edit Success Indicator"
      description={`Editing: ${selectedIndicator.code} - ${selectedIndicator.name}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Indicator'}
          </Button>
        </div>
      }
    >
      <IndicatorForm
        formId={formId}
        onSubmit={handleFormSubmit}
        isLoading={isPending}
        initialValues={{
          code: selectedIndicator.code,
          name: selectedIndicator.name,
          description: selectedIndicator.description,
          dimensions: selectedIndicator.dimensions,
          mov: selectedIndicator.mov,
          ratingScaleTemplateIds: selectedIndicator.ratingScaleTemplateIds,
        }}
        ratingScaleTemplates={selectedTemplates}
      />
    </ResponsiveDialogDashtail>
  )
}
