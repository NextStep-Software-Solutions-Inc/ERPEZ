import { useForm } from '@tanstack/react-form'
import { useAtom } from 'jotai'
import { z } from 'zod'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createFormDataAtom } from '../atoms'
import type { CreateFundSourceType } from '../types'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

// Export schema and types for reuse
export const createFundSourceSchema = z.object({
  name: z
    .string()
    .min(1, 'Fund source name is required')
    .max(100, 'Name must be 100 characters or less'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must be 50 characters or less'),
  type: z.string().min(1, 'Type is required'),
  isActive: z.boolean().default(true),
})

export type CreateFundSourceFormValues = z.infer<typeof createFundSourceSchema>

interface CreateFundSourceFormProps {
  onSubmit: (data: CreateFundSourceType) => void
  onCancel: () => void
  isLoading?: boolean
  initialValues?: Partial<CreateFundSourceFormValues>
}

export default function CreateFundSourceForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues = {},
}: CreateFundSourceFormProps) {
  const [formData, setFormData] = useAtom(createFormDataAtom)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [pendingClose, setPendingClose] = useState<(() => void) | null>(null)

  const form = useForm<CreateFundSourceFormValues>({
    defaultValues: {
      name: initialValues?.name || formData?.name || '',
      code: initialValues?.code || formData?.code || '',
      type: initialValues?.type || formData?.type || '',
      isActive: initialValues?.isActive ?? formData?.isActive ?? true,
    },
    validators: {
      onChange: createFundSourceSchema,
    },
    onSubmit: async (values) => {
      const payload: CreateFundSourceType = {
        name: values.name,
        code: values.code,
        type: values.type,
        isActive: values.isActive,
      }
      onSubmit(payload)
    },
  })

  // Persist form data to Jotai atom on every change
  const updateFormData = (
    fieldName: keyof CreateFundSourceFormValues,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  // Handle close with unsaved changes warning
  const handleCloseAttempt = () => {
    if (form.state.isDirty) {
      setPendingClose(() => onCancel)
      setShowUnsavedWarning(true)
    } else {
      onCancel()
    }
  }

  const handleConfirmDiscard = () => {
    if (pendingClose) {
      pendingClose()
      setPendingClose(null)
    }
    setShowUnsavedWarning(false)
  }

  const handleCancelWarning = () => {
    setShowUnsavedWarning(false)
    setPendingClose(null)
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
        <div className="grid gap-4">
          {/* Name Field */}
          <form.Field
            name="name"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>
                  Fund Source Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    updateFormData('name', e.target.value)
                  }}
                  placeholder="Enter fund source name"
                  disabled={isLoading}
                  className={
                    field.state.meta.errors.length > 0
                      ? 'border-destructive'
                      : ''
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

          {/* Code Field */}
          <form.Field
            name="code"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>
                  Fund Source Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    updateFormData('code', e.target.value)
                  }}
                  placeholder="Enter fund source code"
                  disabled={isLoading}
                  maxLength={50}
                  className={
                    field.state.meta.errors.length > 0
                      ? 'border-destructive'
                      : ''
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

          {/* Type Field */}
          <form.Field
            name="type"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>
                  Type <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    updateFormData('type', e.target.value)
                  }}
                  placeholder="Enter type"
                  disabled={isLoading}
                  className={
                    field.state.meta.errors.length > 0
                      ? 'border-destructive'
                      : ''
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

          {/* Active Status Field */}
          <form.Field
            name="isActive"
            children={(field) => (
              <div className="flex items-center gap-2">
                <input
                  id={field.name}
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.checked)
                    updateFormData('isActive', e.target.checked)
                  }}
                  disabled={isLoading}
                />
                <Label htmlFor={field.name}>Active</Label>
              </div>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseAttempt}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Fund Source
          </Button>
        </div>
      </form>

      {/* Unsaved Changes Warning Dialog */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Unsaved Changes</h2>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes that will be lost. Are you sure you want
              to continue?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelWarning}>
                Keep Editing
              </Button>
              <Button variant="destructive" onClick={handleConfirmDiscard}>
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
