/**
 * Performance Measuring Scale Form Component
 * TanStack Form implementation — decoupled form for create/edit
 * Follows SPMS pattern with external form ID linking
 */

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  BarChart3,
  X,
  Plus,
  Info,
  Type,
  LayoutList,
} from 'lucide-react'
import { type PerformanceMeasuringScaleFormValues } from './performance-measure-scale-form.schema'
import { IndicatorDimension } from '../types'
import type { PerformanceMeasuringScale } from '../types/performance-measuring-scale.types'
import { RatingScaleTemplate } from '@/features/planning/rating-scale-template/types'
import { TemplateDetailPanel } from '@/features/planning/rating-scale-template/components/TemplateDetailPanel'

interface PerformanceMeasuringScaleFormProps {
  formId: string
  defaultValues?: Partial<PerformanceMeasuringScale>
  templates: RatingScaleTemplate[]
  isLoading?: boolean
  onSubmit?: (values: PerformanceMeasuringScaleFormValues) => Promise<void>
  className?: string
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

const RATING_LEVEL_CONFIG = [
  {
    key: 'rating5' as const,
    label: '5 — Excellent',
    sublabel: 'Highest performance',
    colorClass: 'text-emerald-600',
    dotClass: 'bg-emerald-500',
    ratingNumber: 5,
  },
  {
    key: 'rating4' as const,
    label: '4 — Good',
    sublabel: 'Above average',
    colorClass: 'text-blue-600',
    dotClass: 'bg-blue-500',
    ratingNumber: 4,
  },
  {
    key: 'rating3' as const,
    label: '3 — Satisfactory',
    sublabel: 'Meets requirements',
    colorClass: 'text-amber-600',
    dotClass: 'bg-amber-500',
    ratingNumber: 3,
  },
  {
    key: 'rating2' as const,
    label: '2 — Fair',
    sublabel: 'Below average',
    colorClass: 'text-orange-600',
    dotClass: 'bg-orange-500',
    ratingNumber: 2,
  },
  {
    key: 'rating1' as const,
    label: '1 — Poor',
    sublabel: 'Lowest performance',
    colorClass: 'text-rose-600',
    dotClass: 'bg-rose-500',
    ratingNumber: 1,
  },
]

export function PerformanceMeasureScaleForm({
  formId,
  defaultValues,
  templates,
  isLoading = false,
  onSubmit,
  className,
}: PerformanceMeasuringScaleFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<
    RatingScaleTemplate | undefined
  >(() => {
    if (defaultValues?.templateId) {
      return templates.find((t) => t.id === defaultValues.templateId)
    }
    return undefined
  })

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name || '',
      statement: defaultValues?.statement || '',
      dimensions: defaultValues?.dimensions || [],
      templateId: defaultValues?.templateId || '',
      mov: defaultValues?.mov || [''],
      useCustomRating: !!defaultValues?.customRating,
      customRating: defaultValues?.customRating || null,
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value as PerformanceMeasuringScaleFormValues)
      }
    },
  })

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className={cn('space-y-6', className)}
    >
      <div className="grid grid-cols-1 gap-6 border rounded-xl p-6 bg-background">
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
                disabled={isLoading}
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
                  const isChecked = field.state.value.includes(dimension)
                  return (
                    <label
                      key={dimension}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                        isChecked
                          ? 'border-primary/40 bg-primary/5'
                          : 'hover:bg-muted/30',
                        isLoading && 'cursor-default opacity-70',
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const newDimensions = checked
                            ? [...field.state.value, dimension]
                            : field.state.value.filter((d) => d !== dimension)
                          field.handleChange(newDimensions)
                        }}
                        disabled={isLoading}
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
                      const selected = templates.find((t) => t.id === value)
                      setSelectedTemplate(selected)
                    }}
                    disabled={isLoading}
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
                <Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-10 w-10"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View template details and rating levels</p>
                    </TooltipContent>
                  </Tooltip>
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
                    <DialogHeader className="px-6 py-4 border-b">
                      <DialogTitle>
                        Template Details: {selectedTemplate.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
                      <TemplateDetailPanel template={selectedTemplate} />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </TooltipProvider>
            )}
          </div>
          {form.state.fieldMeta.templateId?.errors && (
            <p className="text-xs text-destructive">
              {form.state.fieldMeta.templateId.errors[0]}
            </p>
          )}

          {/* Custom Rating Toggle */}
          <form.Field name="useCustomRating">
            {(field) => (
              <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/30">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    field.handleChange(checked === true)
                    if (!checked) {
                      form.setFieldValue('customRating', null)
                    }
                  }}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">
                    Define Custom Rating Levels
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Override with your own 5-level scale
                  </p>
                </div>
              </label>
            )}
          </form.Field>

          {/* Custom Rating Accordion */}
          <form.Field name="useCustomRating">
            {(field) =>
              field.state.value && (
                <CustomRatingAccordion form={form} isLoading={isLoading} />
              )
            }
          </form.Field>
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
                  {field.state.value.map((mov: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={mov}
                        onChange={(e) => {
                          const newMov = [...field.state.value]
                          newMov[index] = e.target.value
                          field.handleChange(newMov)
                        }}
                        placeholder={`e.g., Accuracy Report, Audit Trail logs`}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      {field.state.value.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newMov = field.state.value.filter(
                              (_: string, i: number) => i !== index,
                            )
                            field.handleChange(newMov)
                          }}
                          disabled={isLoading}
                          className="h-10 w-10 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    field.handleChange([...field.state.value, ''])
                  }}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add MOV
                </Button>

                {field.state.meta.errors && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Evidence types or references for verification of this scale.
                </p>
              </div>
            </div>
          )}
        </form.Field>
      </div>
    </form>
  )
}

/**
 * Custom Rating Accordion — collapsible sections per rating level
 */
function CustomRatingAccordion({
  form,
  isLoading,
}: {
  form: any
  isLoading: boolean
}) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-muted/30 px-4 py-2.5 border-b">
        <p className="text-xs font-semibold text-muted-foreground">
          Rating Level Definitions
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Expand each level to define its description and optional score range
        </p>
      </div>
      <Accordion type="single" collapsible className="divide-y">
        {RATING_LEVEL_CONFIG.map(
          ({ key, label, sublabel, colorClass, dotClass, ratingNumber }) => (
            <AccordionItem value={key} key={key} className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20">
                <div className="flex items-center gap-3 text-left">
                  <div
                    className={cn(
                      'h-2.5 w-2.5 rounded-full shrink-0',
                      dotClass,
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        'text-sm font-semibold leading-none',
                        colorClass,
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sublabel}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-1">
                <CustomRatingLevelFields
                  form={form}
                  rating={key}
                  ratingNumber={ratingNumber}
                  isLoading={isLoading}
                />
              </AccordionContent>
            </AccordionItem>
          ),
        )}
      </Accordion>
    </div>
  )
}

/**
 * Fields for a single custom rating level
 */
function CustomRatingLevelFields({
  form,
  rating,
  ratingNumber,
  isLoading,
}: {
  form: any
  rating: 'rating5' | 'rating4' | 'rating3' | 'rating2' | 'rating1'
  ratingNumber: number
  isLoading: boolean
}) {
  return (
    <form.Field name={`customRating.${rating}`}>
      {(field: any) => (
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Description *</label>
            <textarea
              value={field.state.value?.description || ''}
              onChange={(e) => {
                field.handleChange({
                  ...field.state.value,
                  rating: ratingNumber,
                  description: e.target.value,
                })
              }}
              disabled={isLoading}
              placeholder={`Describe what a rating of ${ratingNumber} means for this indicator...`}
              className="min-h-16 text-sm resize-none p-2 border rounded-md"
            />
            {field.state.meta.errors && (
              <p className="text-xs text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>

          {/* Optional Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                Min Range (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g., 0"
                disabled={isLoading}
                className="h-8 text-sm w-full border rounded-md p-2"
                value={field.state.value?.minRange ?? ''}
                onChange={(e) => {
                  field.handleChange({
                    ...field.state.value,
                    rating: ratingNumber,
                    description: field.state.value?.description || '',
                    minRange: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                Max Range (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g., 100"
                disabled={isLoading}
                className="h-8 text-sm w-full border rounded-md p-2"
                value={field.state.value?.maxRange ?? ''}
                onChange={(e) => {
                  field.handleChange({
                    ...field.state.value,
                    rating: ratingNumber,
                    description: field.state.value?.description || '',
                    maxRange: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }}
              />
            </div>
          </div>
        </div>
      )}
    </form.Field>
  )
}
