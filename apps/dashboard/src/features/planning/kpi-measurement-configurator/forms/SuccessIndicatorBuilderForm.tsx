/**
 * Performance Measure Scale Builder Form Component
 * TanStack Form implementation for bulk creating scales
 */

import { useForm } from '@tanstack/react-form'
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Target, ListChecks } from 'lucide-react'
import type {
  PerformanceMeasuringScaleBuilderFormValues,
  PerformanceMeasuringScaleRowFormValues,
} from '../types/performance-measuring-scale.types'
import { SuccessIndicatorRowForm as PerformanceMeasureScaleRowForm } from './PerformanceMeasureScaleRowForm'
import { MasterKPI } from '@/features/planning/master-kpi/types'
import { RatingScaleTemplate } from '@/features/planning/rating-scale-template/types'

interface PerformanceMeasureScaleBuilderFormProps {
  formId: string
  onSubmit: (data: PerformanceMeasuringScaleBuilderFormValues) => void
  isLoading?: boolean
  masterKpis: MasterKPI[]
  templates: RatingScaleTemplate[]
  initialValues?: Partial<PerformanceMeasuringScaleBuilderFormValues>
}

export function PerformanceMeasureScaleBuilderForm({
  formId,
  onSubmit,
  isLoading = false,
  masterKpis,
  templates,
  initialValues,
}: PerformanceMeasureScaleBuilderFormProps) {
  // Reactive state that syncs with form
  const [masterKPIId, setMasterKPIId] = useState(
    initialValues?.masterKPIId || '',
  )
  const [scales, setScales] = useState<
    PerformanceMeasuringScaleRowFormValues[]
  >(initialValues?.scales || [])

  const form = useForm({
    defaultValues: {
      masterKPIId,
      scales,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as PerformanceMeasuringScaleBuilderFormValues)
    },
  })

  // Subscribe to form state changes and update React state
  useEffect(() => {
    // Sync form state to React state when form changes
    const handleFieldChange = () => {
      const currentMasterKpi = form.getFieldValue('masterKPIId')
      const currentScales = form.getFieldValue('scales')

      setMasterKPIId(currentMasterKpi || '')
      setScales(
        (currentScales as PerformanceMeasuringScaleRowFormValues[]) || [],
      )
    }

    // Trigger sync on mount and when form instance changes
    handleFieldChange()
  }, [form])

  const selectedKpi = masterKpis.find((k) => k.id === masterKPIId)

  const addScaleRow = () => {
    const newScales: PerformanceMeasuringScaleRowFormValues[] = [
      ...scales,
      {
        name: '',
        statement: '',
        dimensions: [],
        mov: [''],
        templateId: '',
        useCustomRating: false,
        customRating: null,
      },
    ]
    setScales(newScales)
    form.setFieldValue('scales', newScales)
  }

  const removeScaleRow = (index: number) => {
    const newScales = scales.filter((_, i) => i !== index)
    setScales(newScales)
    form.setFieldValue('scales', newScales)
  }

  const handleScaleChange = (
    index: number,
    values: PerformanceMeasuringScaleRowFormValues,
  ) => {
    const newScales = [...scales]
    newScales[index] = values
    setScales(newScales)
    form.setFieldValue('scales', newScales)
  }

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Step 1: Master KPI Selection */}
      <div className="rounded-xl border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-muted/30 border-b">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
            1
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-muted-foreground" />
            Select Master KPI
          </div>
        </div>

        <div className="p-5 space-y-4">
          <form.Field name="masterKPIId">
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Master KPI *</label>
                <Select
                  value={field.state.value || ''}
                  onValueChange={(value) => {
                    setMasterKPIId(value)
                    field.handleChange(value)
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Master KPI to add scales for" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterKpis
                      .filter((kpi) => kpi.id)
                      .map((kpi) => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.code} — {kpi.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* KPI Info Card */}
          {selectedKpi && (
            <div className="rounded-lg bg-muted/40 border p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-muted-foreground bg-background border rounded px-1.5 py-0.5">
                  {selectedKpi.code}
                </span>
                <span className="text-sm font-semibold">
                  {selectedKpi.name}
                </span>
              </div>
              {selectedKpi.operationalDefinition && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedKpi.operationalDefinition}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Scale Definitions */}
      <div className="rounded-xl border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-muted/30 border-b">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${selectedKpi ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
          >
            2
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            Define Performance Measure Scales
            {(scales || []).length > 0 && selectedKpi && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({(scales || []).length}{' '}
                {(scales || []).length === 1 ? 'scale' : 'scales'})
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          {selectedKpi ? (
            <div className="space-y-4">
              {/* Scale Rows */}
              {(scales || []).map((scale, index) => (
                <PerformanceMeasureScaleRowForm
                  key={index}
                  index={index}
                  defaultValues={scale}
                  templates={templates}
                  isLoading={isLoading}
                  showRemoveButton={(scales || []).length > 1}
                  onRemove={() => removeScaleRow(index)}
                  onChange={(values) => handleScaleChange(index, values)}
                />
              ))}

              {/* Add Scale Row */}
              <button
                type="button"
                onClick={addScaleRow}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 py-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {(scales || []).length === 0
                  ? 'Add Performance Measure Scale'
                  : 'Add Another Scale'}
              </button>

              {/* Validation error */}
              <form.Field name="scales">
                {(field) =>
                  field.state.meta.errors ? (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null
                }
              </form.Field>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Select a Master KPI above to start adding scales
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />
    </form>
  )
}
