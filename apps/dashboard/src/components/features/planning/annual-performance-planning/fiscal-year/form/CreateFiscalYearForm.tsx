import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'
import { createFormDataAtom, hasUnsavedCreateFormAtom } from '../atoms'

export const createFiscalYearSchema = z.object({
  year: z.number()
    .min(2024, 'Year must be 2024 or later')
    .max(2099, 'Year must be valid'),
  description: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
})

export type CreateFiscalYearFormValues = z.infer<typeof createFiscalYearSchema>

interface CreateFiscalYearFormProps {
  onSubmit: (data: Partial<AppFiscalYear>) => void
  onCancel?: () => void
  initialValues?: Partial<AppFiscalYear>
  isLoading?: boolean
}

export default function CreateFiscalYearForm({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
}: CreateFiscalYearFormProps) {
  const [formData, setFormData] = useAtom(createFormDataAtom)
  const setHasUnsavedChanges = useSetAtom(hasUnsavedCreateFormAtom)

  const formInstance = useForm({
    defaultValues: {
      year: initialValues?.year || new Date().getFullYear(),
      description: initialValues?.description || '',
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
      ...formData,
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

      // Mock FY object for response
      const mockFY: AppFiscalYear = {
        id: `fy-${value.year}`,
        year: value.year,
        description: value.description,
        startDate: value.startDate,
        endDate: value.endDate,
        status: 'Draft',
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      onSubmit(mockFY)
      setHasUnsavedChanges(false)
    },
  })

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const updateFormData = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
    setHasUnsavedChanges(true)
  }

  const isSubmitting = isLoading || formInstance.state.isSubmitting

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        formInstance.handleSubmit()
      }}
      className="space-y-4"
    >
      {/* Year Field */}
      <formInstance.Field
        name="year"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700">
              Fiscal Year <span className="text-red-500">*</span>
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
                field.handleChange(Number(e.target.value))
                updateFormData('year', Number(e.target.value))
              }}
              placeholder="Enter fiscal year (e.g., 2025)"
              disabled={isSubmitting}
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
                field.handleChange(e.target.value)
                updateFormData('startDate', e.target.value)
              }}
              disabled={isSubmitting}
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
                field.handleChange(e.target.value)
                updateFormData('endDate', e.target.value)
              }}
              disabled={isSubmitting}
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
                field.handleChange(e.target.value)
                updateFormData('description', e.target.value)
              }}
              placeholder="Enter fiscal year description (optional)"
              disabled={isSubmitting}
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
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
          <Plus className="w-4 h-4 mr-1" />
          {isSubmitting ? 'Creating...' : 'Create Fiscal Year'}
        </Button>
      </div>
    </form>
  )
}
