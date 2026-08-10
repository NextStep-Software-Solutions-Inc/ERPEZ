import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { FiscalYear } from '../types/types'
import FieldInfo from '@/components/FieldInfo'

const fiscalYearSchema = z.object({
  year: z
    .number()
    .min(2000, 'Year must be at least 2000')
    .max(2100, 'Year must be at most 2100'),
  description: z
    .string()
    .max(200, 'Description must not exceed 200 characters')
    .optional(),
})

export type FiscalYearFormValues = z.infer<typeof fiscalYearSchema>

interface FiscalYearFormProps {
  formId: string
  initialValues?: FiscalYearFormValues
  onSubmit: (values: FiscalYearFormValues) => void
  isLoading?: boolean
  existingYears: FiscalYear[]
  fiscalYearId?: string // Used for uniqueness check on edit
}

/**
 * Shared form component for creating and editing fiscal years.
 * Does not include action buttons to allow them to be placed in dialog footers.
 */
export function FiscalYearForm({
  formId,
  initialValues = {
    year: new Date().getFullYear(),
    description: '',
  },
  onSubmit,
  isLoading = false,
  existingYears,
  fiscalYearId,
}: FiscalYearFormProps) {
  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: fiscalYearSchema.refine(
        (data) =>
          !existingYears.some(
            (ey) => ey.year === data.year && ey.id !== fiscalYearId,
          ),
        {
          message: 'This fiscal year already exists',
          path: ['year'],
        },
      ),
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
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
      className="space-y-4 py-4"
    >
      <form.Field name="year">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Fiscal Year</Label>
            <Input
              id={field.name}
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              disabled={isLoading}
              className={cn(
                'transition-colors',
                field.state.meta.errors.length > 0 &&
                  'border-destructive focus:border-destructive',
              )}
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name}>Description (Optional)</Label>
              <span className="text-xs text-muted-foreground">
                {field.state.value?.length || 0}/200
              </span>
            </div>
            <Input
              id={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Current Fiscal Year"
              disabled={isLoading}
              className={cn(
                'transition-colors',
                field.state.meta.errors.length > 0 &&
                  'border-destructive focus:border-destructive',
              )}
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>
    </form>
  )
}
