import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import type { ReturnBacResolutionPayload } from '../types'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import FieldInfo from '@/components/FieldInfo'

export const returnBacResolutionSchema = z.object({
  reason: z.string().min(1, 'Return reason is required.'),
})

export type ReturnBacResolutionFormValues = z.infer<
  typeof returnBacResolutionSchema
>

interface ReturnBacResolutionFormProps {
  bacResolutionId: string
  onSubmit: (values: ReturnBacResolutionPayload) => Promise<void> | void
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  formId?: string
}

export function ReturnBacResolutionForm({
  bacResolutionId,
  onSubmit,
  isLoading = false,
  onDirtyChange,
  formId,
}: ReturnBacResolutionFormProps) {
  const form = useForm({
    defaultValues: {
      reason: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = returnBacResolutionSchema.safeParse(value)
        if (result.success) {
          return undefined
        }

        return {
          fields: {
            reason:
              result.error.issues[0]?.message ??
              'Return reason is required.',
          },
        }
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        bacResolutionId,
        reason: value.reason,
      })
      onDirtyChange?.(false)
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty, onDirtyChange])

  return (
    <>
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-5"
      >
        <form.Field name="reason">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Return Reason</Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Explain why the BAC Resolution is being returned"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="text-sm text-destructive">
                  <FieldInfo field={field} />
                </div>
              )}
            </div>
          )}
        </form.Field>
      </form>
    </>
  )
}
