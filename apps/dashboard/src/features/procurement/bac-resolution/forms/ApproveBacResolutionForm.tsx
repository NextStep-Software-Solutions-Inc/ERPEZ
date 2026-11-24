import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FieldInfo from '@/components/FieldInfo'
// discard confirmation handled by dialog wrapper

export const approveBacResolutionSchema = z.object({
  signedDocument: z.instanceof(File, {
    message: 'Signed BAC Resolution PDF is required.',
  }),
})

export type ApproveBacResolutionFormValues = z.infer<
  typeof approveBacResolutionSchema
>

interface ApproveBacResolutionFormProps {
  bacResolutionId: string
  onSubmit: (values: ApproveBacResolutionFormValues) => Promise<void> | void
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  formId?: string
}


export function ApproveBacResolutionForm({
  bacResolutionId,
  onSubmit,
  isLoading = false,
  onDirtyChange,
  formId,
}: ApproveBacResolutionFormProps) {
  const form = useForm({
    defaultValues: {
      signedDocument: null as File | null,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = approveBacResolutionSchema.safeParse(value)
        if (result.success) {
          return undefined
        }

        return {
          fields: {
            signedDocument:
              result.error.issues[0]?.message ??
              'Signed BAC Resolution PDF is required.',
          },
        }
      },
    },
    onSubmit: async ({ value }) => {
      if (!value.signedDocument) {
        throw new Error('Signed BAC Resolution PDF is required.')
      }

      await onSubmit({
        signedDocument: value.signedDocument,
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
        <form.Field name="signedDocument">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Signed BAC Resolution PDF</Label>
              <Input
                id={field.name}
                type="file"
                accept="application/pdf"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.files?.[0] ?? null)
                }}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Upload the physically signed and scanned PDF before approving.
              </p>
              {field.state.value && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {field.state.value.name}
                </p>
              )}
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
