/**
 * Approve NTP Form
 * Form for approving an NTP with file upload and approver name
 */

import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ChangeEvent } from 'react'
import { FileUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { ApproveNTPFormValues } from '../types/ntpTypes'

// Zod Schema
export const approveNTPSchema = z.object({
  approvedBy: z
    .string()
    .min(1, 'Approver name is required')
    .max(100, 'Approver name must be 100 characters or less'),
  approvalRemarks: z
    .string()
    .max(500, 'Remarks must be 500 characters or less')
    .optional()
    .default(''),
  signedDocument: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'PDF document is required')
    .refine((file) => file.type === 'application/pdf', 'Only PDF files are allowed')
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .optional(),
})

// Infer type from schema
export type ApproveNTPFormValuesSchema = z.infer<typeof approveNTPSchema>

export interface ApproveNTPFormProps {
  isSubmitting?: boolean
  onSubmit: (values: ApproveNTPFormValues) => void
  onDirtyStateChange?: (isDirty: boolean) => void
}

export function ApproveNTPForm({
  isSubmitting = false,
  onSubmit,
  onDirtyStateChange,
}: ApproveNTPFormProps) {
  const form = useForm<ApproveNTPFormValues>({
    resolver: zodResolver(approveNTPSchema),
    defaultValues: {
      approvedBy: '',
      approvalRemarks: '',
      signedDocument: undefined,
    },
  })

  const selectedFile = form.watch('signedDocument') as File | undefined

  // Notify parent when form becomes dirty
  useEffect(() => {
    if (onDirtyStateChange) {
      onDirtyStateChange(form.formState.isDirty)
    }
  }, [form.formState.isDirty, onDirtyStateChange])

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        form.setValue('signedDocument', file)
      }
    },
    [form]
  )

  const handleRemoveFile = useCallback(() => {
    form.setValue('signedDocument', undefined)
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Approver Name Field */}
        <FormField
          control={form.control}
          name="approvedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approver Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your name" 
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>Your name as the approving authority</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks Field */}
        <FormField
          control={form.control}
          name="approvalRemarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Remarks (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional notes or comments..." 
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

        {/* File Upload Field */}
        <FormField
          control={form.control}
          name="signedDocument"
          render={() => (
            <FormItem>
              <FormLabel>Signed NTP Document (PDF)</FormLabel>
              <div className="space-y-3">
                {selectedFile ? (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-green-700">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <FileUp className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF files up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              <FormDescription>
                Upload the signed NTP document as a PDF file
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-2 justify-end pt-6 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Approving...' : 'Approve NTP'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
