/**
 * Return AOB Dialog Component
 * AlertDialog for returning an AOB to the procuring unit
 * Includes reason for return and optional remarks
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { AOB } from '../types/aobTypes'

/**
 * Return reason enum
 */
export enum ReturnReason {
  INCOMPLETE_BIDS = 'incomplete_bids',
  INVALID_BIDS = 'invalid_bids',
  PROCEDURAL_ERROR = 'procedural_error',
  MISSING_DOCUMENTS = 'missing_documents',
  BUDGET_VARIANCE = 'budget_variance',
  MARKET_CONDITION_CHANGED = 'market_changed',
  OTHER = 'other',
}

/**
 * Zod schema for return AOB form
 */
const returnAOBSchema = z.object({
  returnReason: z.nativeEnum(ReturnReason).refine((val) => val !== undefined, {
    message: 'Please select a reason for return',
  }),
  returnRemarks: z
    .string()
    .min(10, 'Remarks must be at least 10 characters')
    .max(1000, 'Remarks must not exceed 1000 characters'),
})

type ReturnAOBFormValues = z.infer<typeof returnAOBSchema>

interface ReturnAOBDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  aob?: AOB
  onReturn?: (data: {
    reason: ReturnReason
    remarks: string
  }) => Promise<void>
}

/**
 * Return reason display names
 */
const returnReasonLabels: Record<ReturnReason, string> = {
  [ReturnReason.INCOMPLETE_BIDS]: 'Incomplete Bids',
  [ReturnReason.INVALID_BIDS]: 'Invalid Bids',
  [ReturnReason.PROCEDURAL_ERROR]: 'Procedural Error',
  [ReturnReason.MISSING_DOCUMENTS]: 'Missing Documents',
  [ReturnReason.BUDGET_VARIANCE]: 'Budget Variance',
  [ReturnReason.MARKET_CONDITION_CHANGED]: 'Market Condition Changed',
  [ReturnReason.OTHER]: 'Other Reason',
}

/**
 * Return reason descriptions for guidance
 */
const returnReasonDescriptions: Record<ReturnReason, string> = {
  [ReturnReason.INCOMPLETE_BIDS]: 'Bids do not contain all required information or specifications',
  [ReturnReason.INVALID_BIDS]: 'Bids violate technical or commercial requirements',
  [ReturnReason.PROCEDURAL_ERROR]: 'Error in procurement procedure or evaluation process',
  [ReturnReason.MISSING_DOCUMENTS]: 'Required supporting documents are missing or incomplete',
  [ReturnReason.BUDGET_VARIANCE]: 'Awarded prices exceed approved budget limits',
  [ReturnReason.MARKET_CONDITION_CHANGED]: 'Market conditions have changed significantly',
  [ReturnReason.OTHER]: 'Other reasons not listed above',
}

export function ReturnAOBDialog({
  open = false,
  onOpenChange,
  aob,
  onReturn,
}: ReturnAOBDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReturnAOBFormValues>({
    resolver: zodResolver(returnAOBSchema),
    mode: 'onBlur',
  })

  const selectedReason = form.watch('returnReason')

  const onSubmit = async (data: ReturnAOBFormValues) => {
    try {
      setIsSubmitting(true)
      await onReturn?.({
        reason: data.returnReason,
        remarks: data.returnRemarks,
      })
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to return AOB',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Return AOB
          </AlertDialogTitle>
          <AlertDialogDescription>
            Return this AOB to the procuring unit with detailed remarks
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Warning Alert */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            Returning an AOB will reject all current awards and send it back to the procuring
            unit for revision.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form id="return-aob-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* AOB Summary */}
            {aob && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AOB Number</span>
                  <span className="font-semibold">{aob.aobNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold">{aob.status}</span>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {form.formState.errors.root && (
              <Alert variant="soft">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Return Reason */}
            <FormField
              control={form.control}
              name="returnReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Return</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[10000]">
                      {Object.values(ReturnReason).map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {returnReasonLabels[reason]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    {selectedReason && returnReasonDescriptions[selectedReason]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Return Remarks */}
            <FormField
              control={form.control}
              name="returnRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks & Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed reasons for return and specific items that need correction..."
                      rows={5}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {field.value?.length || 0}/1000 characters • Minimum 10 characters required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmation Checkbox */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <label className="flex items-start gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!form.formState.isValid}
                  className="mt-1"
                  required
                />
                <span>
                  I confirm that I want to return this AOB to the procuring unit. All current
                  awards will be rejected.
                </span>
              </label>
            </div>
          </form>
        </Form>

        {/* Dialog Footer */}
        <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
          <AlertDialogCancel
            variant="outline"
            disabled={isSubmitting}
            className="h-10 px-5 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Keep AOB
          </AlertDialogCancel>
          <AlertDialogAction
            form="return-aob-form"
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="h-10 px-6 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white min-w-[140px] shadow-sm"
          >
            {isSubmitting ? 'Returning...' : 'Return AOB'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
