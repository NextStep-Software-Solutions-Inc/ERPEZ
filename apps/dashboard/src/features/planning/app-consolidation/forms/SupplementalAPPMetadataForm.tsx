/**
 * SupplementalAPPMetadataForm - Task 3.2
 * Form for collecting metadata when creating a Supplemental APP
 * Fields: Quarter, Reference/Memo No., Approval Document (optional upload)
 */

import { useState, useCallback } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X } from 'lucide-react'

const supplementalMetadataSchema = z.object({
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    errorMap: () => ({ message: 'Please select a quarter' }),
  }),
  referenceMemoNo: z.string().optional(),
  approvalDocumentFile: z.any().optional(), // File object
  approvalDocumentName: z.string().optional(),
})

export type SupplementalMetadataFormValues = z.infer<typeof supplementalMetadataSchema>

interface SupplementalAPPMetadataFormProps {
  onSubmit: (values: SupplementalMetadataFormValues) => Promise<void>
  isLoading?: boolean
}

export function SupplementalAPPMetadataForm({
  onSubmit,
  isLoading = false,
}: SupplementalAPPMetadataFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const form = useForm({
    defaultValues: {
      quarter: 'Q1' as const,
      referenceMemoNo: '',
      approvalDocumentFile: null,
      approvalDocumentName: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
    validators: {
      onChange: supplementalMetadataSchema,
    },
  })

  const handleFileUpload = useCallback(
    (file: File | null) => {
      setUploadedFile(file)
      form.setFieldValue('approvalDocumentFile', file)
      form.setFieldValue('approvalDocumentName', file?.name || '')
    },
    [form]
  )

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-900">
            <strong>Supplemental APP Creation</strong>
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Fill in the details below to create a new supplemental APP. This allows you to consolidate mid-year amendments and additions to your procurement plan.
          </p>
        </CardContent>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* Quarter Selection */}
        <form.Field name="quarter">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Quarter <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Select the quarter when this supplemental was approved or will take effect
              </p>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent className="z-[999999]">
                  <SelectItem value="Q1">Q1 (January - March)</SelectItem>
                  <SelectItem value="Q2">Q2 (April - June)</SelectItem>
                  <SelectItem value="Q3">Q3 (July - September)</SelectItem>
                  <SelectItem value="Q4">Q4 (October - December)</SelectItem>
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-600 mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Reference/Memo No. */}
        <form.Field name="referenceMemoNo">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Reference / Memo No.
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Enter the memo number, resolution number, or other reference (optional)
              </p>
              <Input
                placeholder="e.g., Memo No. 2024-001, BAC Resolution No. 2024-123"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-600 mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Approval Document Upload */}
        <form.Field name="approvalDocumentFile">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Approval Document
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Upload supporting document (e.g., routing slip, HoPE memo, resolution) - optional
              </p>

              {!uploadedFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }
                    input.click()
                  }}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 5MB)</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
                    <p className="text-xs text-green-700">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileUpload(null)}
                    disabled={isLoading}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {field.state.meta.errors && (
                <p className="text-sm text-red-600 mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isLoading || !form.state.canSubmit}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Continue to PPMP Selection'}
          </Button>
        </div>
      </form>
    </div>
  )
}
