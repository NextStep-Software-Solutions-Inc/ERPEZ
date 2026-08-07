/**
 * AmendmentReasonForm
 * Captures the reason for creating a mid-year amendment from an approved PPMP.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'

const amendmentReasonSchema = z.object({
  reason: z
    .string()
    .min(20, 'Please provide at least 20 characters explaining the reason for amendment.')
    .max(500, 'Reason must not exceed 500 characters.'),
})

export type AmendmentReasonFormValues = z.infer<typeof amendmentReasonSchema>

interface AmendmentReasonFormProps {
  onSubmit: (data: AmendmentReasonFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function AmendmentReasonForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: AmendmentReasonFormProps) {
  const form = useForm<AmendmentReasonFormValues>({
    resolver: zodResolver(amendmentReasonSchema),
    defaultValues: { reason: '' },
  })

  const reasonValue = form.watch('reason')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Amendment</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Describe the reason for this mid-year amendment (e.g., change in procurement priorities, additional budget allocation, correction of items)..."
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-right text-xs">
                {reasonValue.length} / 500
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} variant="default">
            {isLoading ? 'Creating Amendment...' : 'Create Amendment'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
