import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '../../../../components/ui/button'
import { Label } from '../../../../components/ui/label'
import { Textarea } from '../../../../components/ui/textarea'
import { ConfirmAlertDialog } from '../../../../components/ConfirmAlertDialog'
import type { ReturnNoticeOfAwardPayload } from '../types'
import FieldInfo from '../../../../components/FieldInfo'

const returnNoticeOfAwardSchema = z.object({
  remarks: z.string().min(1, 'Remarks are required.'),
})

type ReturnNoticeOfAwardFormProps = {
  noaId: string
  isLoading?: boolean
  onSubmit: (values: ReturnNoticeOfAwardPayload) => Promise<void> | void
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

export function ReturnNoticeOfAwardForm({
  noaId,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: ReturnNoticeOfAwardFormProps) {
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const form = useForm({
    defaultValues: {
      remarks: '',
    },
    validators: {
      onSubmit: returnNoticeOfAwardSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ noaId, remarks: value.remarks })
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
        <form.Field name="remarks">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Remarks</Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Explain why the NOA is being returned"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 ? (
                <div className="text-sm text-destructive">
                  <FieldInfo field={field} />
                </div>
              ) : null}
            </div>
          )}
        </form.Field>

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
            {isLoading ? 'Returning...' : 'Return'}
          </Button>
        </div>
      </form>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard return remarks?"
        description="You have unsaved return remarks. Do you want to discard them?"
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
