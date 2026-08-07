import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'

export const updateFiscalYearSchema = z.object({
  year: z.number().optional(),
  description: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
})

export type UpdateFiscalYearFormValues = z.infer<typeof updateFiscalYearSchema>

interface UpdateFiscalYearFormProps {
  fiscalYear: AppFiscalYear
  onSubmit: (data: Partial<AppFiscalYear>) => void
  onCancel?: () => void
  onValueChange?: (fieldName: keyof AppFiscalYear, value: any) => void
  isLoading?: boolean
}

export default function UpdateFiscalYearForm({
  fiscalYear,
  onSubmit,
  onCancel,
  onValueChange,
  isLoading = false,
}: UpdateFiscalYearFormProps) {
  const formInstance = useForm({
    defaultValues: {
      year: fiscalYear.year,
      description: fiscalYear.description || '',
      startDate: fiscalYear.startDate || '',
      endDate: fiscalYear.endDate || '',
    },
    onSubmit: async ({ value }) => {
      // Validate date range
      if (value.startDate && value.endDate) {
        const newStart = new Date(value.startDate)
        const newEnd = new Date(value.endDate)

        if (newStart > newEnd) {
          formInstance.setFieldMeta('startDate', (meta) => (({
            ...meta,
            touchedError: 'Start date must be before end date',
          })))
          return
        }
      }

      onSubmit({
        year: value.year,
        description: value.description,
        startDate: value.startDate,
        endDate: value.endDate,
      })
    },
  })

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const isSubmitting = isLoading || formInstance.state.isSubmitting
  const isReadOnly = fiscalYear.isLocked || fiscalYear.status === 'Draft'

  useEffect(() => {
    formInstance.setFieldValue('year', fiscalYear.year)
    formInstance.setFieldValue('description', fiscalYear.description || '')
    formInstance.setFieldValue('startDate', fiscalYear.startDate || '')
    formInstance.setFieldValue('endDate', fiscalYear.endDate || '')
  }, [fiscalYear.id])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        formInstance.handleSubmit()
      }}
      className="space-y-4"
    >
      {isReadOnly && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm text-amber-800">
            This fiscal year is locked and cannot be edited.
          </p>
        </div>
      )}

      {/* Year Field */}
      <formInstance.Field
        name="year"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700">
              Fiscal Year
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              min="2024"
              max="2099"
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const value = Number(e.target.value)
                field.handleChange(value)
                onValueChange?.('year', value)
              }}
              placeholder="Enter fiscal year (e.g., 2025)"
              disabled={isSubmitting || isReadOnly}
              className={
                field.state.meta.errors.length > 0 ? 'border-destructive' : ''
              }
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      />

      {/* Start Date Field */}
      <formInstance.Field
        name="startDate"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700">
              Start Date
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const value = e.target.value
                field.handleChange(value)
                onValueChange?.('startDate', value)
              }}
              disabled={isSubmitting || isReadOnly}
              className={
                field.state.meta.errors.length > 0 ? 'border-destructive' : ''
              }
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      />

      {/* End Date Field */}
      <formInstance.Field
        name="endDate"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700">
              End Date
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const value = e.target.value
                field.handleChange(value)
                onValueChange?.('endDate', value)
              }}
              disabled={isSubmitting || isReadOnly}
              className={
                field.state.meta.errors.length > 0 ? 'border-destructive' : ''
              }
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      />

      {/* Description Field */}
      <formInstance.Field
        name="description"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700">
              Description
            </Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const value = e.target.value
                field.handleChange(value)
                onValueChange?.('description', value)
              }}
              placeholder="Enter fiscal year description (optional)"
              disabled={isSubmitting || isReadOnly}
              rows={3}
              className={
                field.state.meta.errors.length > 0 ? 'border-destructive' : ''
              }
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      />

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting || isReadOnly}
        >
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? 'Updating...' : 'Update Fiscal Year'}
        </Button>
      </div>
    </form>
  )
}
