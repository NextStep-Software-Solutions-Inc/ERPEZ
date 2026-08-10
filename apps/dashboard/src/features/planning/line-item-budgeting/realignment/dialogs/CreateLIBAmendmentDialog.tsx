import { useState } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useCreateLIBAmendment } from '../hooks/useLIBAmendments'
import {
  CreateLIBAmendmentForm,
  type LIBAmendmentFormApi,
  type CreateLIBAmendmentFormValues,
} from '../forms/CreateLIBAmendmentForm'
import { Loader2 } from 'lucide-react'

interface CreateLIBAmendmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lineItemBudgetId: string
  onSuccess: () => Promise<void> | void
}

export function CreateLIBAmendmentDialog({
  open,
  onOpenChange,
  lineItemBudgetId,
  onSuccess,
}: CreateLIBAmendmentDialogProps) {
  const { toast } = useToast()
  const [form, setForm] = useState<LIBAmendmentFormApi | null>(null)
  const { mutateAsync: createAmendment, isPending } = useCreateLIBAmendment()

  const handleSubmit = async (values: CreateLIBAmendmentFormValues) => {
    try {
      await createAmendment({
        pathParams: {},
        payload: {
          lineItemBudgetId,
          reason: values.reason,
          justification: values.justification,
        },
      })
      await onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to submit realignment request.',
        variant: 'destructive',
      })
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Submit Realignment for Approval"
      description="To create a version audit entry and submit this realignment request, please provide your justification."
      size="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          {form && (
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  onClick={() => form.handleSubmit()}
                  disabled={!canSubmit || isSubmitting || isPending}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 gap-1.5"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-2">
        <CreateLIBAmendmentForm
          onSubmit={handleSubmit}
          hideFooterButtons={true}
          setForm={setForm}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
