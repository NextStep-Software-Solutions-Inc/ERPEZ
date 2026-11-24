/**
 * Approve Contract Modal
 *
 * Dialog for approving a contract (internal approving authority).
 * RA 12009 workflow: internal approval is a document-review and authorization
 * step. File upload and bilateral signing are governed in Phase 4 (Execution).
 */

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

const approveContractSchema = z.object({
  remarks: z.string().optional(),
})

type ApproveContractFormData = z.infer<typeof approveContractSchema>

interface ApproveContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (remarks?: string) => void
  isLoading?: boolean
}

export function ApproveContractModal({ open, onOpenChange, onApprove, isLoading }: ApproveContractModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ApproveContractFormData>({
    resolver: zodResolver(approveContractSchema),
    defaultValues: { remarks: '' },
  })

  const onSubmit = async (data: ApproveContractFormData) => {
    setIsSubmitting(true)
    try {
      onApprove(data.remarks?.trim() || undefined)
      form.reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const busy = isLoading || isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Approve Contract
          </DialogTitle>
          <DialogDescription>
            Approve this contract for internal authorization. Document upload and bilateral signing
            are completed in the Contract Execution step.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval Remarks <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any remarks for this approval..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy} className="bg-green-600 hover:bg-green-700">
                {busy ? 'Approving...' : 'Approve Contract'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
