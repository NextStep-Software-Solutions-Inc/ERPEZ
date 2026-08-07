/**
 * Return NTP Form
 * Form for returning an NTP to procuring unit
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReturnNTPFormValues, ReturnReason } from '../types/ntpTypes'

// Zod Schema
export const returnNTPSchema = z.object({
  returnReason: z.enum([
    'Documentation Error',
    'Missing Information',
    'Incorrect Supplier Details',
    'Amount Mismatch',
    'Other',
  ] as const),
  returnRemarks: z
    .string()
    .max(500, 'Remarks must be 500 characters or less')
    .optional()
    .default(''),
})

// Infer type from schema
export type ReturnNTPFormValuesSchema = z.infer<typeof returnNTPSchema>

const returnReasons: { value: ReturnReason; label: string; description: string }[] = [
  {
    value: 'Documentation Error' as ReturnReason,
    label: 'Documentation Error',
    description: 'Errors found in the NTP documentation',
  },
  {
    value: 'Missing Information' as ReturnReason,
    label: 'Missing Information',
    description: 'Required information is missing or incomplete',
  },
  {
    value: 'Incorrect Supplier Details' as ReturnReason,
    label: 'Incorrect Supplier Details',
    description: 'Supplier information does not match the source document',
  },
  {
    value: 'Amount Mismatch' as ReturnReason,
    label: 'Amount Mismatch',
    description: 'Total amount does not match the source document',
  },
  {
    value: 'Other' as ReturnReason,
    label: 'Other',
    description: 'Other reason (please specify in remarks)',
  },
]

export interface ReturnNTPFormProps {
  isSubmitting?: boolean
  onSubmit: (values: ReturnNTPFormValues) => void
}

export function ReturnNTPForm({
  isSubmitting = false,
  onSubmit,
}: ReturnNTPFormProps) {
  const form = useForm<ReturnNTPFormValues>({
    resolver: zodResolver(returnNTPSchema),
    defaultValues: {
      returnReason: 'Documentation Error' as ReturnReason,
      returnRemarks: '',
    },
  })

  const selectedReason = form.watch('returnReason')
  const reasonDetails = returnReasons.find((r) => r.value === selectedReason)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Return Reason Field */}
        <FormField
          control={form.control}
          name="returnReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Return Reason</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {returnReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {reasonDetails && (
                <FormDescription>{reasonDetails.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks Field */}
        <FormField
          control={form.control}
          name="returnRemarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Remarks</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide detailed remarks explaining the reason for return..."
                  {...field}
                  rows={4}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                {(field.value || '').length}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Warning Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            <strong>Note:</strong> Returning this NTP will send it back to the procuring unit for revisions. The status will be set to "Returned" and action will be required.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2 justify-end pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? 'Returning...' : 'Return NTP'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
