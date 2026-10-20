import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FieldInfo from '@/components/FieldInfo'
import { MODIFICATION_REASONS, formatModificationReason } from '../constants/realignmentConstants'
import { Button } from '@/components/ui/button'

const createLIBAmendmentSchema = z.object({
  reason: z.string().min(1, 'Reason type is required'),
  justification: z.string().min(1, 'Explanation is required'),
})

export type CreateLIBAmendmentFormValues = z.infer<typeof createLIBAmendmentSchema>

const useLIBAmendmentFormInstance = (
  onSubmit: (values: CreateLIBAmendmentFormValues) => void,
) =>
  useForm({
    defaultValues: {
      reason: '',
      justification: '',
    },
    validators: {
      onChange: createLIBAmendmentSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

export type LIBAmendmentFormApi = ReturnType<typeof useLIBAmendmentFormInstance>

interface CreateLIBAmendmentFormProps {
  onSubmit: (values: CreateLIBAmendmentFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  hideFooterButtons?: boolean
  setForm?: (form: LIBAmendmentFormApi) => void
}

export function CreateLIBAmendmentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  hideFooterButtons = false,
  setForm,
}: CreateLIBAmendmentFormProps) {
  const form = useForm({
    defaultValues: {
      reason: '',
      justification: '',
    },
    validators: {
      onChange: createLIBAmendmentSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  useEffect(() => {
    setForm?.(form)
  }, [form, setForm])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4 text-xs"
    >
      <form.Field
        name="reason"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-semibold text-slate-700">
              Reason for Modification *
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(val) => field.handleChange(val)}
            >
              <SelectTrigger id={field.name} className="text-xs">
                <SelectValue placeholder="Select a reason type..." />
              </SelectTrigger>
              <SelectContent>
                {MODIFICATION_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {formatModificationReason(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Field
        name="justification"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-semibold text-slate-700">
              Detailed Explanation / Justification *
            </Label>
            <Textarea
              id={field.name}
              placeholder="Provide a detailed explanation for this request..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
              className="text-xs resize-none"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {!hideFooterButtons && (
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="text-xs h-9"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white text-xs h-9"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save & Create'}
          </Button>
        </div>
      )}
    </form>
  )
}
