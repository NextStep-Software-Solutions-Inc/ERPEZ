/**
 * KPI Measurement Configurator Dialogs
 * Uses ResponsiveDialogDashtail following SPMS pattern
 */

import { useAtom } from 'jotai'
import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  createMeasurementDialogOpenAtom,
  editMeasurementDialogOpenAtom,
  deleteMeasurementDialogOpenAtom,
  selectedMeasurementForDeleteAtom,
  selectedMeasurementForEditAtom,
} from '../atoms'
import { PerformanceMeasureScaleBuilderForm } from '../forms/PerformanceMeasureScaleBuilderForm'
import { PerformanceMeasureScaleForm } from '../forms/PerformanceMeasureScaleForm'
import {
  useCreateKpiMeasurementsBulk,
  useUpdateKpiMeasurement,
  useDeleteKpiMeasurement,
} from '../handlers/hooks'
import type { PerformanceMeasuringScaleBuilderFormValues } from '../types/performance-measuring-scale.types'
import { type PerformanceMeasuringScaleFormValues } from '../forms/performance-measure-scale-form.schema'
import { useKpis } from '@/features/planning/master-kpi/handlers/hooks'
import { useRatingScaleTemplates } from '@/features/planning/rating-scale-template/handlers/hooks'
import { KpiLibrarySearchParams } from '@/routes/v2/kpi-library/constants'

/**
 * Create/Bulk Create Performance Measure Scale Dialog
 */
export function CreateMeasurementDialog() {
  const [open, setOpen] = useAtom(createMeasurementDialogOpenAtom)
  const { createKpiMeasurementsBulk, isPending } =
    useCreateKpiMeasurementsBulk()

  const search = useSearch({
    from: '/v2/kpi-library/',
  }) as KpiLibrarySearchParams

  const kpiParam = search.kpi

  const initialValues = useMemo(() => {
    if (kpiParam && kpiParam !== 'new') {
      return { masterKPIId: kpiParam, scales: [] }
    }
    return undefined
  }, [kpiParam])

  const { data: kpisData, isLoading: isLoadingKpis } = useKpis({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useRatingScaleTemplates({ pathParams: {}, queryParams: {} })

  const masterKpis = kpisData?.data || []
  const templates = templatesData?.data || []

  const handleSubmit = async (
    data: PerformanceMeasuringScaleBuilderFormValues,
  ) => {
    try {
      await createKpiMeasurementsBulk(data)
      toast.success('Performance measure scales created successfully')
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create scales',
      )
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Add Performance Measure Scale"
      description="Tag dimensions, assign default MOVs, and link rating templates before the OPCR target cascade."
      size="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            form="create-measurement-form"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create Scales'}
          </Button>
        </div>
      }
    >
      <div className="py-4">
        <PerformanceMeasureScaleBuilderForm
          formId="create-measurement-form"
          onSubmit={handleSubmit}
          isLoading={isPending || isLoadingKpis || isLoadingTemplates}
          masterKpis={masterKpis}
          templates={templates}
          initialValues={initialValues}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}

/**
 * Edit Performance Measure Scale Dialog
 */
export function EditMeasurementDialog() {
  const [open, setOpen] = useAtom(editMeasurementDialogOpenAtom)
  const [selectedScale] = useAtom(selectedMeasurementForEditAtom)
  const { updateKpiMeasurement, isPending } = useUpdateKpiMeasurement()
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useRatingScaleTemplates({ pathParams: {}, queryParams: {} })

  const templates = templatesData?.data || []

  if (!selectedScale) return null

  const handleSubmit = async (data: PerformanceMeasuringScaleFormValues) => {
    try {
      await updateKpiMeasurement(selectedScale.id, {
        name: data.name,
        statement: data.statement,
        dimensions: data.dimensions,
        moVs: data.mov.map((m) => m ?? null),
        ratingScaleTemplateId: data.templateId ?? null,
        isMOVEditable: data.isMOVEditable,
        isScaleEditable: data.isScaleEditable,
      })
      toast.success('Performance measure scale updated successfully')
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update scale',
      )
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Edit Performance Measure Scale"
      description="Modify the details of this KPI measurement configuration."
      size="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            form="edit-measurement-form"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Updating...' : 'Update Scale'}
          </Button>
        </div>
      }
    >
      <div className="py-2">
        <PerformanceMeasureScaleForm
          formId="edit-measurement-form"
          defaultValues={selectedScale}
          templates={templates}
          isLoading={isPending || isLoadingTemplates}
          onSubmit={handleSubmit}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}

/**
 * Delete Performance Measure Scale Dialog (Confirmation)
 */
export function DeleteMeasurementDialog() {
  const [open, setOpen] = useAtom(deleteMeasurementDialogOpenAtom)
  const [selectedScale] = useAtom(selectedMeasurementForDeleteAtom)
  const { deleteKpiMeasurement, isPending } = useDeleteKpiMeasurement()

  if (!selectedScale) return null

  const handleDelete = async () => {
    try {
      await deleteKpiMeasurement(selectedScale.id)
      toast.success('Performance measure scale deleted successfully')
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete scale',
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Performance Measure Scale</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this performance measure scale? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 justify-end">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
