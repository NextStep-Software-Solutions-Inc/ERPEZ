/**
 * Create NTP Form
 * Form for creating a new Notice to Proceed
 * Uses React Hook Form + Zod validation
 */

import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { ApprovedPOForNTP, ApprovedContractForNTP } from '../types/ntpTypes'

// Zod Schema
export const createNTPSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  ntpNumber: z
    .string()
    .min(1, 'NTP Number is required')
    .max(50, 'NTP Number must be 50 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .default(''),
  sourceDocumentId: z.string().min(1, 'Please select a PO or Contract'),
  sourceType: z.enum(['PO', 'Contract']),
})

// Infer type from schema
export type CreateNTPFormValues = z.infer<typeof createNTPSchema>

export interface CreateNTPFormProps {
  selectedSourceDoc?: ApprovedPOForNTP | ApprovedContractForNTP | null
  sourceType?: 'PO' | 'Contract'
  supplierName?: string
  totalAmount?: number
  isSubmitting?: boolean
  onSelectSourceDocument: () => void
  onSubmit: (values: CreateNTPFormValues) => void
}

export function CreateNTPForm({
  selectedSourceDoc,
  sourceType,
  supplierName,
  totalAmount,
  isSubmitting = false,
  onSelectSourceDocument,
  onSubmit,
}: CreateNTPFormProps) {
  const form = useForm<CreateNTPFormValues>({
    resolver: zodResolver(createNTPSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      ntpNumber: '',
      description: '',
      sourceDocumentId: '',
      sourceType: 'PO',
    },
  })

  // Sync selectedSourceDoc prop to form state
  useEffect(() => {
    if (selectedSourceDoc && sourceType) {
      form.setValue('sourceDocumentId', selectedSourceDoc.id, { shouldValidate: true })
      form.setValue('sourceType', sourceType, { shouldValidate: true })
    }
  }, [selectedSourceDoc, sourceType, form])

  // Update source document ID when selected
  const handleSourceDocumentSelected = useCallback(() => {
    onSelectSourceDocument()
  }, [onSelectSourceDocument])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled />
              </FormControl>
              <FormDescription>Today's date</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* NTP Number Field */}
        <FormField
          control={form.control}
          name="ntpNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NTP Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., NTP-2024-001" 
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>Unique identifier for this NTP</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional details about this NTP..." 
                  {...field}
                  rows={3}
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

        {/* Source Document Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Link Source Document</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSourceDocumentSelected}
            >
              {selectedSourceDoc ? 'Change Source' : 'Select Source'}
            </Button>
          </div>

          {selectedSourceDoc ? (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {form.getValues('sourceType') === 'PO' 
                      ? `PO: ${(selectedSourceDoc as ApprovedPOForNTP).poNumber || selectedSourceDoc.id}`
                      : `Contract: ${(selectedSourceDoc as ApprovedContractForNTP).contractNumber || selectedSourceDoc.id}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSourceDoc.supplier?.supplierName || supplierName || 'Unknown Supplier'}
                  </p>
                </div>
                <Badge variant="outline">
                  {form.getValues('sourceType')}
                </Badge>
              </div>

              <div className="pt-2 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-sm font-semibold">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(selectedSourceDoc.amount || totalAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="text-sm font-semibold">
                    {selectedSourceDoc.itemCount || 0}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No source document selected. Click "Select Source" to choose a PO or Contract.
              </p>
            </div>
          )}

          {!selectedSourceDoc && (
            <FormMessage className="text-red-600">
              Please select a source document to proceed
            </FormMessage>
          )}
        </div>

        {/* Supplier & Amount Display (Auto-filled) */}
        {(supplierName || totalAmount) && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {supplierName && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Supplier</p>
                <p className="text-sm font-semibold">{supplierName}</p>
              </div>
            )}
            {totalAmount && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Amount</p>
                <p className="text-sm font-semibold">
                  {new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(totalAmount)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-2 justify-end pt-6 border-t">
          <Button type="submit" disabled={isSubmitting || !selectedSourceDoc}>
            {isSubmitting ? 'Creating...' : 'Create NTP'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
