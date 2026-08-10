/**
 * BulkAdjustmentForm
 * TanStack Form + Zod for the bulk price adjustment workspace.
 * Fields: mode, adjustmentPercent, reason
 */

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BulkAdjustmentMode } from '../types'

export const bulkAdjustmentSchema = z.object({
  mode: z.enum(['selected', 'category'] as const),
  adjustmentPercent: z
    .number({ error: 'Must be a number' })
    .min(-99, 'Minimum adjustment is -99%')
    .max(200, 'Maximum adjustment is 200%')
    .refine((v) => v !== 0, 'Adjustment must be non-zero'),
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  category: z.string().optional().nullable(),
})

export type BulkAdjustmentFormValues = z.infer<typeof bulkAdjustmentSchema>

interface BulkAdjustmentFormProps {
  defaultMode?: BulkAdjustmentMode
  selectedCount?: number
  onPreview: (data: BulkAdjustmentFormValues) => void
  onApply: (data: BulkAdjustmentFormValues) => void
  isApplying?: boolean
}

const CATEGORIES = [
  'Maintenance Services',
  'IT Services',
  'Catering Services',
  'Security Services',
  'Printing Services',
  'Transport Services',
  'Training Services',
  'Media Services',
  'Consultancy Services',
  'Event Services',
]

export function BulkAdjustmentForm({
  defaultMode = 'selected',
  selectedCount = 0,
  onPreview,
  onApply,
  isApplying = false,
}: BulkAdjustmentFormProps) {
  const form = useForm({
    defaultValues: {
      mode: defaultMode as BulkAdjustmentMode,
      adjustmentPercent: 0,
      reason: '',
      category: null as string | null,
    },
    onSubmit: async ({ value }) => {
      const result = bulkAdjustmentSchema.safeParse(value)
      if (result.success) {
        onApply(result.data)
      }
    },
  })

  const handlePreview = () => {
    const values = form.state.values
    const result = bulkAdjustmentSchema.safeParse(values)
    if (result.success) {
      onPreview(result.data)
    } else {
      form.handleSubmit()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5"
    >
      {/* Adjustment Mode */}
      <form.Field name="mode">
        {(field) => (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Adjust</label>
            <Select
              value={field.state.value as string}
              onValueChange={(v) => field.handleChange(v as BulkAdjustmentMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">
                  Selected items ({selectedCount})
                </SelectItem>
                <SelectItem value="category">Entire category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      {/* Category selector (only when mode = 'category') */}
      <form.Subscribe selector={(s) => s.values.mode}>
        {(mode) =>
          mode === 'category' ? (
            <form.Field name="category">
              {(field) => (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={(field.state.value as string) ?? ''}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          ) : null
        }
      </form.Subscribe>

      {/* Adjustment Percent */}
      <form.Field name="adjustmentPercent">
        {(field) => (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Adjustment % <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                min={-99}
                max={200}
                step={0.1}
                value={field.state.value as number}
                onChange={(e) =>
                  field.handleChange(parseFloat(e.target.value) || 0)
                }
                placeholder="e.g. 5 for +5%, -10 for -10%"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Positive = price increase, negative = price decrease
            </p>
          </div>
        )}
      </form.Field>

      {/* Reason */}
      <form.Field name="reason">
        {(field) => (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Annual price survey update per DBM circular..."
              rows={3}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handlePreview}
          disabled={isApplying}
        >
          Preview
        </Button>
        <Button type="submit" className="flex-1" disabled={isApplying}>
          {isApplying ? 'Applying…' : 'Apply Adjustment'}
        </Button>
      </div>
    </form>
  )
}
