/**
 * Approve Contract Modal
 * Dialog for approving a contract with signed PDF upload
 */

import { useState, useEffect } from 'react'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Upload } from 'lucide-react'

const approveContractSchema = z.object({
  pdfFile: z.instanceof(File, { message: 'PDF file is required' }).refine(
    (file) => file.type === 'application/pdf',
    'File must be a PDF',
  ),
})

type ApproveContractFormData = z.infer<typeof approveContractSchema>

interface ApproveContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (signedPdfUrl: string) => void
}

export function ApproveContractModal({ open, onOpenChange, onApprove }: ApproveContractModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileSelected, setFileSelected] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const form = useForm<ApproveContractFormData>({
    resolver: zodResolver(approveContractSchema),
    defaultValues: {
      pdfFile: undefined,
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileSelected(file)
      form.setValue('pdfFile', file)
    }
  }

  const onSubmit = async (data: ApproveContractFormData) => {
    setIsSubmitting(true)
    try {
      const signedPdfUrl = URL.createObjectURL(data.pdfFile)
      setObjectUrl(signedPdfUrl)

      onApprove(signedPdfUrl)
      setFileSelected(null)
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
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Approve Contract
          </DialogTitle>
          <DialogDescription>
            Upload the physically signed contract document to approve it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pdfFile"
              render={() => (
                <FormItem>
                  <FormLabel>Signed Contract Document</FormLabel>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition">
                    <Input
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
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {fileSelected ? fileSelected.name : 'Click to upload or drag and drop'}
                        </p>
                        {!fileSelected && (
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF files only
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800">
                <span className="font-medium">Note:</span> Ensure the PDF contains the
                physical signature of the approving authority and all required
                approval marks as per procurement standards.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  setFileSelected(null)
                  form.reset()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !fileSelected}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Approving...' : 'APPROVE'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
