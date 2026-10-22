/**
 * Return Contract Modal
 * Dialog for returning a contract with mandatory remarks (min 10 characters).
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
import { AlertCircle } from 'lucide-react'

const returnContractSchema = z.object({
  remarks: z.string().min(10, 'Remarks must be at least 10 characters'),
})

type ReturnContractFormData = z.infer<typeof returnContractSchema>

interface ReturnContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReturn: (remarks: string) => void
  isLoading?: boolean
}

export function ReturnContractModal({ open, onOpenChange, onReturn, isLoading }: ReturnContractModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReturnContractFormData>({
    resolver: zodResolver(returnContractSchema),
    defaultValues: { remarks: '' },
  })

  const onSubmit = async (data: ReturnContractFormData) => {
    setIsSubmitting(true)
    try {
      onReturn(data.remarks)
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
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Return Contract
          </DialogTitle>
          <DialogDescription>
            Please provide remarks explaining why this contract is being returned.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for returning this contract..."
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
              <Button type="submit" variant="destructive" disabled={busy}>
                {busy ? 'Returning...' : 'Return Contract'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
