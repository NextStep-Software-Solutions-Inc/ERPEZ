import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import IndicatorForm from '../forms/IndicatorForm'
import {
  addIndicatorDialogOpenAtom,
  addIndicatorFormDataAtom,
  kpiWithIndicatorsAtom,
} from '../atoms'
import {
  createIndicatorHandler,
  getAvailableKpisHandler,
  getKpiWithIndicatorsHandler,
} from '../handlers'
import type { IndicatorFormValues } from '../forms/indicator-form.schema'

const formId = 'add-indicator-form'

export function AddIndicatorDialog() {
  const [open, setOpen] = useAtom(addIndicatorDialogOpenAtom)
  const [formData, setFormData] = useAtom(addIndicatorFormDataAtom)
  const [_, setKpisWithIndicators] = useAtom(kpiWithIndicatorsAtom)
  const [selectedTemplates, setSelectedTemplates] = useState<
    Array<{ id: string; name: string }>
  >([])

  // Fetch available KPIs for selector
  const { data: availableKpis = [] } = useQuery({
    queryKey: ['available-kpis'],
    queryFn: getAvailableKpisHandler,
  })

  // Get rating scale templates - mock data for now
  useEffect(() => {
    // In a real app, fetch from rating-scale-template handlers
    setSelectedTemplates([
      { id: 'efficiency-scale', name: 'Efficiency Scale' },
      { id: 'accuracy-scale', name: 'Accuracy Scale' },
      { id: 'timeliness-scale', name: 'Timeliness Scale' },
      { id: 'satisfaction-scale', name: 'Satisfaction Scale' },
    ])
  }, [])

  // Create indicator mutation
  const { mutateAsync: createIndicator, isPending } = useMutation({
    mutationFn: async (indicatorData: IndicatorFormValues) => {
      if (!formData.selectedKpiId) {
        throw new Error('No KPI selected')
      }
      return createIndicatorHandler(formData.selectedKpiId, indicatorData)
    },
    onSuccess: async () => {
      toast.success('Indicator created successfully')
      // Refresh KPI list
      const result = await getKpiWithIndicatorsHandler()
      setKpisWithIndicators(result.data)
      // Reset dialog
      setOpen(false)
      setFormData({ selectedKpiId: null, step: 1 })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create indicator',
      )
    },
  })

  const handleKpiSelect = (kpiId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedKpiId: kpiId,
      step: 2,
    }))
  }

  const handleBackToKpiSelection = () => {
    setFormData((prev) => ({
      ...prev,
      step: 1,
    }))
  }

  const handleFormSubmit = (values: IndicatorFormValues) => {
    createIndicator(values)
  }

  const handleDialogClose = () => {
    setOpen(false)
    setFormData({ selectedKpiId: null, step: 1 })
  }

  const selectedKpiData = availableKpis.find(
    (kpi) => kpi.id === formData.selectedKpiId,
  )

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={handleDialogClose}
      title={formData.step === 1 ? 'Select KPI' : 'Define Success Indicator'}
      description={
        formData.step === 1
          ? 'Choose a KPI to add a success indicator'
          : `Adding indicator for: ${selectedKpiData?.code} - ${selectedKpiData?.name}`
      }
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <div>
            {formData.step === 2 && (
              <Button
                variant="outline"
                onClick={handleBackToKpiSelection}
                disabled={isPending}
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            {formData.step === 1 ? (
              <Button
                disabled={!formData.selectedKpiId || isPending}
                onClick={() => {
                  if (formData.selectedKpiId) {
                    handleKpiSelect(formData.selectedKpiId)
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button form={formId} type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Indicator'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {formData.step === 1 ? (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="kpi-select">Select KPI *</Label>
            <Select
              value={formData.selectedKpiId || ''}
              onValueChange={handleKpiSelect}
            >
              <SelectTrigger id="kpi-select">
                <SelectValue placeholder="Choose a KPI" />
              </SelectTrigger>
              <SelectContent>
                {availableKpis.map((kpi) => (
                  <SelectItem key={kpi.id} value={kpi.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{kpi.code}</span>
                      <span className="text-xs text-gray-500">{kpi.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableKpis.length === 0 && (
              <p className="text-sm text-gray-500">
                No KPIs available. Please create KPIs first.
              </p>
            )}
          </div>
        </div>
      ) : (
        <IndicatorForm
          formId={formId}
          onSubmit={handleFormSubmit}
          isLoading={isPending}
          ratingScaleTemplates={selectedTemplates}
        />
      )}
    </ResponsiveDialogDashtail>
  )
}
