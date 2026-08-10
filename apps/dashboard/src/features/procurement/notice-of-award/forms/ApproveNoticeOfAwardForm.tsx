import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { ApproveNoticeOfAwardPayload } from '../types'
import { Input } from '@/components/ui/input'
import { Eye } from 'lucide-react'
import FieldInfo from '@/components/FieldInfo'

const approveNoticeOfAwardSchema = z.object({
  signedDocument: z.custom<File | null>(
    (val) => val instanceof File,
    { message: 'Signed NOA PDF is required.' }
  ),
  customFileName: z.string(),
})

type ApproveNoticeOfAwardFormProps = {
  noaId: string
  isLoading?: boolean
  onSubmit: (values: ApproveNoticeOfAwardPayload) => Promise<void> | void
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

export function ApproveNoticeOfAwardForm({
  noaId,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: ApproveNoticeOfAwardFormProps) {
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const form = useForm({
    defaultValues: {
      signedDocument: null as File | null,
      customFileName: '',
    },
    validators: {
      onSubmit: approveNoticeOfAwardSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.signedDocument) {
        throw new Error('Signed NOA PDF is required.')
      }

      const rawName = value.customFileName?.trim() || value.signedDocument.name
      const finalFileName = rawName.endsWith('.pdf') ? rawName : `${rawName}.pdf`
      const fileToSubmit = new File([value.signedDocument], finalFileName, {
        type: value.signedDocument.type,
      })

      await onSubmit({
        noaId,
        signedDocument: fileToSubmit,
      })
      onDirtyChange?.(false)
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty, onDirtyChange])

  const requestClose = () => {
    if (form.state.isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onCancel()
  }

  return (
    <>
      <form
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
              <Label htmlFor={field.name}>Signed NOA PDF</Label>
              <Input
                id={field.name}
                type="file"
                accept="application/pdf"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  field.handleChange(file)
                  if (file) {
                    form.setFieldValue('customFileName', file.name)
                  } else {
                    form.setFieldValue('customFileName', '')
                  }
                }}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Upload the HoPE-signed NOA. Supplier conforme is tracked after
                issuance.
              </p>
              {field.state.meta.errors.length > 0 ? (
                <div className="text-sm text-destructive">
                  <FieldInfo field={field} />
                </div>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values}>
          {(values) => {
            if (!values.signedDocument) return null
            return (
              <div className="space-y-3 rounded-lg border border-default-200 p-3 bg-default-50/50 mt-2 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-default-700">File Details</span>
                  <Button
                    type="button"
                    variant="outline"
                    color="secondary"
                    className="h-8 text-xs gap-1.5 px-2.5 font-medium shadow-sm hover:bg-default-100 border-default-300"
                    onClick={() => {
                      if (values.signedDocument) {
                        const url = URL.createObjectURL(values.signedDocument)
                        window.open(url, '_blank')
                      }
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 text-default-500" />
                    View PDF
                  </Button>
                </div>
                <form.Field name="customFileName">
                  {(subField) => (
                    <div className="grid gap-1.5">
                      <Label htmlFor={subField.name} className="text-xs font-medium text-default-600">
                        Rename Document
                      </Label>
                      <Input
                        id={subField.name}
                        type="text"
                        value={subField.state.value}
                        onBlur={subField.handleBlur}
                        onChange={(e) => subField.handleChange(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter document name"
                        className="h-9 text-sm bg-white border-default-200"
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            )
          }}
        </form.Subscribe>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={requestClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || form.state.isSubmitting}>
            {isLoading ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </form>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard signed document?"
        description="You have an unsaved signed NOA selected. Do you want to discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setShowDiscardWarning(false)
          onDirtyChange?.(false)
          onCancel()
        }}
      />
    </>
  )
}
