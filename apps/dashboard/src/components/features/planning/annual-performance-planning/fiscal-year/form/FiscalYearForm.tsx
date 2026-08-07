/**
 * Fiscal Year Form - Standalone Component
 * 
 * Supports both create and update operations with:
 * - Year selection (2024-2099)
 * - Start/End date validation
 * - Description input
 * - Lock status management
 * - Client-side validation
 */

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'

// Validation schema
export const fiscalYearFormSchema = z.object({
  year: z.number()
    .min(2024, 'Year must be 2024 or later')
    .max(2099, 'Year must be valid'),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().optional().default(''),
}).refine(
  (data) => {
    // If both dates are provided, validate range
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return start < end
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export type FiscalYearFormValues = z.infer<typeof fiscalYearFormSchema>

interface FiscalYearFormProps {
  /**
   * Existing fiscal year for update mode
   * If not provided, form operates in create mode
   */
  fiscalYear?: AppFiscalYear
  
  /**
   * Callback when form is submitted
   */
  onSubmit: (data: Partial<AppFiscalYear>) => void
  
  /**
   * Callback when user cancels
   */
  onCancel?: () => void
  
  /**
   * Loading state (e.g., API call in progress)
   */
  isLoading?: boolean
  
  /**
   * Whether form is read-only (for locked FYs)
   */
  isReadOnly?: boolean
}

export default function FiscalYearForm({
  fiscalYear,
  onSubmit,
  onCancel,
  isLoading = false,
  isReadOnly = false,
}: FiscalYearFormProps) {
  const [dateValidationError, setDateValidationError] = useState<string>('')
  const isEditMode = !!fiscalYear
  const isLockedForEdit = isReadOnly || (isEditMode && (fiscalYear?.isLocked || fiscalYear?.status === 'Locked'))

  const form = useForm({
    defaultValues: {
      year: fiscalYear?.year ?? new Date().getFullYear(),
      startDate: fiscalYear?.startDate?.split('T')[0] ?? '',
      endDate: fiscalYear?.endDate?.split('T')[0] ?? '',
      description: fiscalYear?.description ?? '',
    },
    onSubmit: async ({ value }) => {
      // Clear previous validation error
      setDateValidationError('')

      // Validate date range
      if (value.startDate && value.endDate) {
        const start = new Date(value.startDate)
        const end = new Date(value.endDate)

        if (start >= end) {
          setDateValidationError('End date must be after start date')
          return
        }
      }

      // Submit data
      onSubmit({
        year: value.year,
        startDate: value.startDate ? new Date(value.startDate).toISOString() : undefined,
        endDate: value.endDate ? new Date(value.endDate).toISOString() : undefined,
        description: value.description,
      })
    },
  })

  const isSubmitting = isLoading || form.state.isSubmitting
  const currentYear = form.state.values.year

  useEffect(() => {
    if (fiscalYear) {
      form.setFieldValue('year', fiscalYear.year)
      form.setFieldValue('startDate', fiscalYear.startDate?.split('T')[0] ?? '')
      form.setFieldValue('endDate', fiscalYear.endDate?.split('T')[0] ?? '')
      form.setFieldValue('description', fiscalYear.description ?? '')
    }
  }, [fiscalYear?.id])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      {/* Read-only Warning */}
      {isLockedForEdit && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This fiscal year is locked and cannot be edited.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Title */}
      {isEditMode && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Edit Fiscal Year {fiscalYear?.year}</h3>
            {fiscalYear?.isLocked && (
              <Badge className="bg-amber-100 text-amber-800">Locked</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Update details for this fiscal year
          </p>
        </div>
      )}

      {/* Fiscal Year Field */}
      <form.Field
        name="year"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="font-medium">
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
              onChange={(e) => field.handleChange(Number(e.target.value))}
              placeholder="e.g., 2025"
              disabled={isSubmitting || isLockedForEdit}
              className={
                field.state.meta.errors.length > 0 ? 'border-red-500' : ''
              }
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">
                {field.state.meta.errors[0]}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Valid range: 2024 - 2099
            </p>
          </div>
        )}
      />

      {/* Start Date Field */}
      <form.Field
        name="startDate"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="font-medium">
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
                setDateValidationError('')
              }}
              disabled={isSubmitting || isLockedForEdit}
              className={dateValidationError ? 'border-red-500' : ''}
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">
                {field.state.meta.errors[0]}
              </p>
            )}
            <p className="text-xs text-gray-500">
              When the fiscal year begins
            </p>
          </div>
        )}
      />

      {/* End Date Field */}
      <form.Field
        name="endDate"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="font-medium">
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
                setDateValidationError('')
              }}
              disabled={isSubmitting || isLockedForEdit}
              className={dateValidationError ? 'border-red-500' : ''}
            />
            {dateValidationError && (
              <p className="text-sm text-red-600">{dateValidationError}</p>
            )}
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && !dateValidationError && (
              <p className="text-sm text-red-600">
                {field.state.meta.errors[0]}
              </p>
            )}
            <p className="text-xs text-gray-500">
              When the fiscal year ends
            </p>
          </div>
        )}
      />

      {/* Description Field */}
      <form.Field
        name="description"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="font-medium">
              Description
            </Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., FY 2025 Performance Planning Cycle"
              disabled={isSubmitting || isLockedForEdit}
              rows={3}
              className={
                field.state.meta.errors.length > 0 ? 'border-red-500' : ''
              }
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">
                {field.state.meta.errors[0]}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Optional notes about this fiscal year
            </p>
          </div>
        )}
      />

      {/* Info Box with Year Details */}
      {currentYear && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-900">
            <strong>Fiscal Year {currentYear}</strong> will be used to organize KPI activation and target setting throughout the planning cycle.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isLockedForEdit}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Fiscal Year' : 'Create Fiscal Year')}
        </Button>
      </div>
    </form>
  )
}
