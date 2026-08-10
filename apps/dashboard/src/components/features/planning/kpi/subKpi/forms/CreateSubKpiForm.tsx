/**
 * CreateSubKpiForm Component
 * Form for creating a new SubKPI under a parent KPI
 * Uses TanStack Form + Zod validation
 * Max 200 lines per guidelines
 */
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import type { CreateSubKPIPayload } from '../handlers/createSubKpiRequest'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

/** Validation schema for SubKPI form */
export const createSubKpiSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters'),
  description: z.string().optional(),
  SDGs: z.array(z.string()),
  kpiRatings: z.array(
    z.object({
      performanceMeasureId: z.string(),
      ratings: z
        .array(
          z.object({
            value: z.number().optional(),
            remarks: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
  kpiTargets: z.array(
    z.object({
      period: z.string().min(1, 'Period is required'),
      value: z.number().min(0, 'Value must be positive'),
      quarterName: z.string().min(1, 'Quarter name is required'),
    }),
  ),
  kpiMovs: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().min(1, 'Description is required'),
      file: z.string().min(1, 'File is required'),
    }),
  ),
})

export type CreateSubKpiFormValues = z.infer<typeof createSubKpiSchema>

interface CreateSubKpiFormProps {
  onSubmit: (data: CreateSubKPIPayload) => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * CreateSubKpiForm Component
 * Renders a form for creating SubKPIs with validation
 */
export default function CreateSubKpiForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateSubKpiFormProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [pendingClose, setPendingClose] = useState<(() => void) | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      description: undefined as string | undefined,
      SDGs: [] as Array<string>,
      kpiRatings: [] as Array<{
        performanceMeasureId: string
        ratings?: Array<{
          value?: number
          remarks?: string
        }>
      }>,
      kpiTargets: [] as Array<{
        period: string
        value: number
        quarterName: string
      }>,
      kpiMovs: [] as Array<{
        name: string
        description: string
        file: string
      }>,
    },
    validators: {
      onChange: ({ value }) => {
        const result = createSubKpiSchema.safeParse(value)
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(', ')
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as CreateSubKPIPayload)
    },
  })

  /** Handle cancel with unsaved changes warning */
  const handleCancel = () => {
    if (form.state.isDirty) {
      setPendingClose(() => onCancel)
      setShowUnsavedWarning(true)
    } else {
      onCancel()
    }
  }

  /** Confirm discard of unsaved changes */
  const handleConfirmDiscard = () => {
    if (pendingClose) {
      form.reset()
      pendingClose()
      setPendingClose(null)
    }
    setShowUnsavedWarning(false)
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* Name Field */}
        <form.Field
          name="name"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                SubKPI Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter SubKPI name"
                disabled={isLoading}
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
        <form.Field
          name="description"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Description</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter SubKPI description (optional)"
                disabled={isLoading}
                rows={3}
              />
            </div>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !form.state.canSubmit}
            className="bg-(--button-blue)"
          >
            {isLoading ? 'Creating...' : 'Create SubKPI'}
          </Button>
        </div>
      </form>

      {/* Unsaved Changes Warning */}
      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to continue?"
        onConfirm={handleConfirmDiscard}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}
