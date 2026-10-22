/**
 * Approve AOB Dialog Component
 * AlertDialog for submitting/approving an AOB
 * Includes PDF document upload for approval record
 */

import { useState, useRef, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react'
import type { AOB } from '../types/aobTypes'
import { AOBStatus } from '../types/aobTypes'
import { useKeycloak } from '@/providers/KeycloakProvider'

/**
 * Zod schema for approve AOB form
 */
const approveAOBSchema = z.object({
  approvalDocument: z
    .any()
    .optional()
    .nullable()
    .refine(
      (file) => !file || (file instanceof File && file.type === 'application/pdf'),
      'File must be a PDF'
    ),
  approvalRemarks: z.string().max(500, 'Remarks must be 500 characters or less').optional(),
  approvedBy: z.string().min(1, 'Name is required'),
})

type ApproveAOBFormValues = z.infer<typeof approveAOBSchema>

interface ApproveAOBDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  aob?: AOB
  winnerCount?: number
  totalItems?: number
  onApprove?: (data: {
    approvalDocument?: File | null
    approvalRemarks?: string
    approvedBy: string
  }) => Promise<void>
}

export function ApproveAOBDialog({
  open = false,
  onOpenChange,
  aob,
  winnerCount = 0,
  totalItems = 0,
  onApprove,
}: ApproveAOBDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const keycloak = (() => {
    try {
      return useKeycloak()
    } catch {
      return null
    }
  })()

  const defaultAuthorizer =
    [keycloak?.firstName, keycloak?.lastName].filter(Boolean).join(' ') ||
    keycloak?.userName ||
    aob?.approvedBy ||
    ''

  const form = useForm<ApproveAOBFormValues>({
    resolver: zodResolver(approveAOBSchema),
    mode: 'onBlur',
    defaultValues: {
      approvedBy: defaultAuthorizer,
      approvalRemarks: '',
      approvalDocument: null,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        approvedBy: defaultAuthorizer,
        approvalRemarks: '',
        approvalDocument: null,
      })
      setUploadedFile(null)
    }
  }, [open, defaultAuthorizer, form])

  const onSubmit = async (data: ApproveAOBFormValues) => {
    try {
      setIsSubmitting(true)
      await onApprove?.({
        approvalDocument: data.approvalDocument ?? null,
        approvalRemarks: data.approvalRemarks,
        approvedBy: data.approvedBy,
      })
      form.reset()
      setUploadedFile(null)
      onOpenChange?.(false)
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to approve AOB',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        form.setError('approvalDocument', {
          message: 'Only PDF files are accepted',
        })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        form.setError('approvalDocument', {
          message: 'File size must not exceed 10MB',
        })
        return
      }
      setUploadedFile(file)
      form.setValue('approvalDocument', file)
    }
  }

  const hasItemCount = (totalItems ?? 0) > 0
  const isAllItemsAwarded = hasItemCount
    ? (winnerCount ?? 0) >= (totalItems ?? 0)
    : Boolean(
        aob?.status === AOBStatus.FOR_APPROVAL ||
        aob?.status === AOBStatus.APPROVED ||
        (aob?.awardedItems && aob.awardedItems.length > 0)
      )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Approve AOB</AlertDialogTitle>
          <AlertDialogDescription>
            Submit this Abstract of Bids for approval. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form id="approve-aob-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* AOB Summary */}
            {aob && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AOB Number</span>
                  <span className="font-semibold">{aob.aobNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Award Criterion</span>
                  <span className="font-semibold">{aob.awardCriterion || 'LCRB'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold">{aob.status}</span>
                </div>
              </div>
            )}

            {/* Award Completion Status */}
            {totalItems > 0 && (
              <div
                className={`p-3 rounded border ${
                  isAllItemsAwarded
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isAllItemsAwarded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-xs font-medium">
                    {winnerCount}/{totalItems} items awarded
                  </span>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {form.formState.errors.root && (
              <Alert variant="soft">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            {/* PDF Upload */}
            <FormField
              control={form.control}
              name="approvalDocument"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Approval Document (PDF){' '}
                    <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {uploadedFile ? (
                        <div className="space-y-2">
                          <FileText className="w-8 h-8 mx-auto text-green-600" />
                          <div className="text-sm font-medium text-green-600">
                            {uploadedFile.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              fileInputRef.current?.click()
                            }}
                          >
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-gray-400" />
                          <div className="text-sm text-gray-700">
                            Click to upload PDF
                          </div>
                          <div className="text-xs text-gray-600">
                            Max 10MB
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Optional: Upload the signed AOB approval document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Approved By */}
            <FormField
              control={form.control}
              name="approvedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved By</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Name of authorizing official
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Remarks */}
            <FormField
              control={form.control}
              name="approvalRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    500 characters maximum
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Dialog Footer */}
        <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
          <AlertDialogCancel
            variant="outline"
            disabled={isSubmitting}
            className="h-10 px-5 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            form="approve-aob-form"
            type="submit"
            disabled={isSubmitting || !isAllItemsAwarded}
            className="h-10 px-6 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] shadow-sm"
          >
            {isSubmitting ? 'Approving...' : 'Approve AOB'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
