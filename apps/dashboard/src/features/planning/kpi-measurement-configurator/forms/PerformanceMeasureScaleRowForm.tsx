/**
 * Performance Measuring Scale Row Form Component
 * TanStack Form implementation for a single scale row in the builder
 */
import React from 'react'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import {
  Trash2,
  BookOpen,
  BarChart3,
  X,
  Plus,
  Info,
  Type,
  LayoutList,
} from 'lucide-react'
import { IndicatorDimension } from '../types'
import { RatingScaleTemplate } from '@/features/planning/rating-scale-template/types'
import { TemplateDetailPanel } from '@/features/planning/rating-scale-template/components/TemplateDetailPanel'
import { cn } from '@/lib/utils'
import type { PerformanceMeasuringScaleRowFormValues } from '../types/performance-measuring-scale.types'

interface PerformanceMeasuringScaleRowFormProps {
  index: number
  defaultValues: PerformanceMeasuringScaleRowFormValues
  templates: RatingScaleTemplate[]
  isLoading?: boolean
  readonly?: boolean
  onRemove?: () => void
  onChange?: (values: PerformanceMeasuringScaleRowFormValues) => void
  showRemoveButton?: boolean
}

const DIMENSION_CONFIG: Record<
  IndicatorDimension,
  { color: 'info' | 'warning' | 'success'; description: string }
> = {
  [IndicatorDimension.EFFICIENCY]: {
    color: 'info',
    description: 'Measurable output count',
  },
  [IndicatorDimension.QUALITY]: {
    color: 'warning',
    description: 'Standard of the output',
  },
  [IndicatorDimension.TIMELINESS]: {
    color: 'success',
    description: 'When it is delivered',
  },
}

export function SuccessIndicatorRowForm({
  index,
  defaultValues,
  templates,
  isLoading = false,
  readonly = false,
  onRemove,
  onChange,
  showRemoveButton = true,
}: PerformanceMeasuringScaleRowFormProps) {
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<RatingScaleTemplate | null>(() => {
      if (defaultValues.templateId) {
        return templates.find((t) => t.id === defaultValues.templateId) || null
      }
      return null
    })
  const [isTemplateDetailsOpen, setTemplateDetailsOpen] = React.useState(false)

  React.useEffect(() => {
    if (!selectedTemplate) {
      setTemplateDetailsOpen(false)
    }
  }, [selectedTemplate])

  const form = useForm({
    defaultValues,
  })

  const prevValuesRef =
    React.useRef<PerformanceMeasuringScaleRowFormValues | null>(null)

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        // Only call onChange when values actually change, not on every render
        const valuesJson = JSON.stringify(values)
        const prevValuesJson = JSON.stringify(prevValuesRef.current)

        if (valuesJson !== prevValuesJson && onChange) {
          onChange(values as PerformanceMeasuringScaleRowFormValues)
        }
        prevValuesRef.current = values

        return (
          <div className="rounded-xl border bg-card overflow-hidden">
            {/* Row Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Performance Measuring Scale
                </span>
              </div>
              {showRemoveButton && !readonly && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={onRemove}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  title="Remove this scale"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* 1-column body */}
            <div className="p-6 space-y-6">
              {/* Name Field */}
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Type className="h-3.5 w-3.5" />
                      Scale Name
                    </div>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Accuracy of Financial Reports"
                      disabled={isLoading || readonly}
                    />
                    {field.state.meta.errors && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Dimensions Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" />
                  Dimensions (QET) *
                </div>

                <form.Field name="dimensions">
                  {(field) => (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {Object.values(IndicatorDimension).map((dimension) => {
                        const config = DIMENSION_CONFIG[dimension]
                        const isChecked = (field.state.value || []).includes(
                          dimension,
                        )
                        return (
                          <label
                            key={dimension}
                            className={cn(
                              'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                              isChecked
                                ? 'border-primary/40 bg-primary/5'
                                : 'hover:bg-muted/30',
                              (isLoading || readonly) &&
                                'cursor-default opacity-70',
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const newDimensions = checked
                                  ? [...(field.state.value || []), dimension]
                                  : (field.state.value || []).filter(
                                      (d) => d !== dimension,
                                    )
                                field.handleChange(newDimensions)
                              }}
                              disabled={isLoading || readonly}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <Badge variant="outline" className="text-xs">
                                {dimension}
                              </Badge>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {config.description}
                              </p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </form.Field>
                {form.state.fieldMeta.dimensions?.errors && (
                  <p className="text-xs text-destructive">
                    {form.state.fieldMeta.dimensions.errors[0]}
                  </p>
                )}
              </div>

              <Separator />

              {/* Rating Scale Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Rating Scale
                </div>

                <div className="flex items-end gap-2">
                  <form.Field name="templateId">
                    {(field) => (
                      <div className="flex-1 space-y-1.5">
                        <label className="text-sm font-medium">
                          Rating Scale Template *
                        </label>
                        <Select
                          value={field.state.value || ''}
                          onValueChange={(value) => {
                            field.handleChange(value)
                            const selected =
                              templates.find((t) => t.id === value) || null
                            setSelectedTemplate(selected)
                          }}
                          disabled={isLoading || readonly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  {/* Tooltip and Popover for Template Details */}
                  {selectedTemplate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={isLoading || readonly}
                            className="shrink-0 h-10 w-10"
                            onClick={() => setTemplateDetailsOpen(true)}
                            type="button"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View template details and rating levels</p>
                        </TooltipContent>
                      </Tooltip>
                      <ResponsiveDialogDashtail
                        open={isTemplateDetailsOpen}
                        onOpenChange={setTemplateDetailsOpen}
                        title={`Template Details: ${selectedTemplate.name}`}
                        description="Review the rating levels and criteria for this template."
                        size="2xl"
                      >
                        <div className="px-6 py-4">
                          <TemplateDetailPanel
                            template={selectedTemplate}
                            hideActions
                          />
                        </div>
                      </ResponsiveDialogDashtail>
                    </TooltipProvider>
                  )}
                </div>
                {form.state.fieldMeta.templateId?.errors && (
                  <p className="text-xs text-destructive">
                    {form.state.fieldMeta.templateId.errors[0]}
                  </p>
                )}
              </div>

              <Separator />

              {/* MOV Array Section */}
              <form.Field name="mov">
                {(field) => (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <LayoutList className="h-3.5 w-3.5" />
                      Evidence
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Means of Verification (MOV) *
                      </label>

                      <div className="space-y-2">
                        {(field.state.value || []).map(
                          (mov: string, idx: number) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                value={mov}
                                onChange={(e) => {
                                  const newMov = [...(field.state.value || [])]
                                  newMov[idx] = e.target.value
                                  field.handleChange(newMov)
                                }}
                                placeholder="e.g., Accuracy Report, Audit Trail logs"
                                disabled={isLoading || readonly}
                                className="flex-1"
                              />
                              {(field.state.value || []).length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newMov = (
                                      field.state.value || []
                                    ).filter(
                                      (_: string, i: number) => i !== idx,
                                    )
                                    field.handleChange(newMov)
                                  }}
                                  disabled={isLoading || readonly}
                                  className="h-10 w-10 text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ),
                        )}
                      </div>

                      {!readonly && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            field.handleChange([
                              ...(field.state.value || []),
                              '',
                            ])
                          }}
                          disabled={isLoading}
                          className="gap-2"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add MOV
                        </Button>
                      )}

                      {field.state.meta.errors && (
                        <p className="text-xs text-destructive">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </form.Field>

              <Separator />

              {/* Editable Flags Section */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Editability Flags
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.Field name="isMOVEditable">
                    {(field) => (
                      <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <Checkbox
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked as boolean)
                          }
                          disabled={isLoading || readonly}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">MOV Editable</p>
                          <p className="text-xs text-muted-foreground">
                            Allow editing Means of Verification
                          </p>
                        </div>
                      </label>
                    )}
                  </form.Field>

                  <form.Field name="isScaleEditable">
                    {(field) => (
                      <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <Checkbox
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked as boolean)
                          }
                          disabled={isLoading || readonly}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Scale Editable</p>
                          <p className="text-xs text-muted-foreground">
                            Allow editing rating scale template
                          </p>
                        </div>
                      </label>
                    )}
                  </form.Field>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </form.Subscribe>
  )
}
