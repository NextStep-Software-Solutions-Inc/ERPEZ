/**
 * Approve PR Modal
 * Dialog for approving a PR with signed PDF upload
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Upload } from 'lucide-react'

const approvePRSchema = z.object({
  pdfFile: z.instanceof(File, { message: 'PDF file is required' }).refine(
    (file) => file.type === 'application/pdf',
    'File must be a PDF',
  ),
})

type ApprovePRFormData = z.infer<typeof approvePRSchema>

interface ApprovePRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (signedPdfUrl: string) => void
}

export function ApprovePRModal({ open, onOpenChange, onApprove }: ApprovePRModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileSelected, setFileSelected] = useState<File | null>(null)

  const form = useForm<ApprovePRFormData>({
    resolver: zodResolver(approvePRSchema),
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

  const onSubmit = async (data: ApprovePRFormData) => {
    setIsSubmitting(true)
    try {
      // Revoke any previously created object URL to avoid leaking memory
      const win = window as any
      if (win.__approvePR_lastObjectUrl) {
        try {
          URL.revokeObjectURL(win.__approvePR_lastObjectUrl)
        } catch {
          // ignore if revoke fails
        }
        delete win.__approvePR_lastObjectUrl
      }

      // Create a new object URL and store it so it can be revoked later
      const signedPdfUrl = URL.createObjectURL(data.pdfFile)
      win.__approvePR_lastObjectUrl = signedPdfUrl

      // Expose a helper to allow other parts of the app to revoke the latest URL
      win.__approvePR_revokePrevious = () => {
        if (win.__approvePR_lastObjectUrl) {
          try {
            URL.revokeObjectURL(win.__approvePR_lastObjectUrl)
          } catch {
            // ignore
          }
          delete win.__approvePR_lastObjectUrl
        }
      }

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
            Approve Purchase Request
          </DialogTitle>
          <DialogDescription>
            Upload the physically signed PR document to approve it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pdfFile"
              render={() => (
                <FormItem>
                  <FormLabel>Signed PR Document</FormLabel>
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
                            PDF files only, up to 10MB
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
                approval marks as per Appendix 60 standards.
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
