/**
 * Return PR Modal
 * Dialog for returning a PR with remarks
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

const returnPRSchema = z.object({
  remarks: z.string().min(10, 'Remarks must be at least 10 characters'),
})

type ReturnPRFormData = z.infer<typeof returnPRSchema>

interface ReturnPRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReturn: (remarks: string) => void
}

export function ReturnPRModal({ open, onOpenChange, onReturn }: ReturnPRModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReturnPRFormData>({
    resolver: zodResolver(returnPRSchema),
    defaultValues: {
      remarks: '',
    },
  })

  const onSubmit = async (data: ReturnPRFormData) => {
    setIsSubmitting(true)
    try {
      onReturn(data.remarks)
      form.reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Return Purchase Request
          </DialogTitle>
          <DialogDescription>
            Please provide remarks explaining why this PR is being returned.
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
                      placeholder="Explain the reason for returning this PR..."
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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Returning...' : 'RETURN'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
